// Global variables
let workbook = null;
let apiKey = localStorage.getItem('gemini_api_key') || '';
let extractedShapes = [];

// Initialize API key display
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Initialize API key
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
        showApiKeyStatus('APIキーが保存されています', 'success');
    }
    
    // Setup file input handler
    const fileInput = document.getElementById('excelFile');
    if (fileInput) {
        console.log('Setting up file input handler');
        fileInput.addEventListener('change', handleFileUpload);
    } else {
        console.error('File input element not found!');
    }
    
    // Setup drag and drop
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        console.log('Setting up drag and drop handlers');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        });
    }
});

// Save API Key
function saveApiKey() {
    const input = document.getElementById('apiKey');
    apiKey = input.value.trim();
    
    if (!apiKey) {
        showApiKeyStatus('APIキーを入力してください', 'error');
        return;
    }
    
    localStorage.setItem('gemini_api_key', apiKey);
    showApiKeyStatus('APIキーを保存しました', 'success');
}

// Make function available globally
window.saveApiKey = saveApiKey;

function showApiKeyStatus(message, type) {
    const statusDiv = document.getElementById('apiKeyStatus');
    const colorClass = type === 'success' ? 'text-green-600' : 'text-red-600';
    statusDiv.innerHTML = `<p class="text-sm ${colorClass}">${message}</p>`;
    
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 3000);
}

// Handle file upload
async function handleFileUpload(event) {
    console.log('File upload handler called');
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, file.size, 'bytes');
    
    // Verify API key
    if (!apiKey) {
        alert('先にGemini APIキーを設定してください');
        event.target.value = '';
        return;
    }
    
    // Show file info
    const fileInfoDiv = document.getElementById('fileInfo');
    fileInfoDiv.innerHTML = `
        <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span><strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)</span>
        </div>
    `;
    
    // Show loading
    showLoading('Excelファイルを読み込んでいます...');
    
    try {
        // Read Excel file
        console.log('Reading file as ArrayBuffer...');
        const data = await readFileAsArrayBuffer(file);
        console.log('File read successfully, size:', data.byteLength);
        
        console.log('Parsing Excel file...');
        workbook = XLSX.read(data, { 
            type: 'array',
            cellStyles: true,
            bookVBA: true
        });
        console.log('Excel parsed, sheets:', workbook.SheetNames);
        
        // Extract text from shapes
        updateLoadingMessage('オブジェクトからテキストを抽出しています...');
        console.log('Extracting shapes...');
        extractedShapes = await extractShapeTexts(workbook, data);
        console.log('Extracted shapes:', extractedShapes.length);
        
        if (extractedShapes.length === 0) {
            hideLoading();
            alert('オブジェクト（図形・テキストボックス）内のテキストが見つかりませんでした。\n\nExcelファイルに図形やテキストボックスが含まれているか確認してください。');
            event.target.value = '';
            return;
        }
        
        // Display extracted texts
        console.log('Displaying extracted texts...');
        displayExtractedTexts(extractedShapes);
        
        // Check for errors with Gemini
        updateLoadingMessage('AI解析中（誤字脱字をチェックしています）...');
        console.log('Starting Gemini analysis...');
        await checkTextWithGemini(extractedShapes);
        
        console.log('Processing complete');
        hideLoading();
        
    } catch (error) {
        console.error('Error processing file:', error);
        hideLoading();
        alert('ファイルの処理中にエラーが発生しました: ' + error.message);
        event.target.value = '';
    }
}

// Read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

// Extract texts from shapes and objects
async function extractShapeTexts(workbook, fileData) {
    const shapes = [];
    
    try {
        console.log('Loading JSZip...');
        // Parse the Excel file as ZIP to access drawing XML files
        const JSZip = await loadJSZip();
        console.log('JSZip loaded, parsing file as ZIP...');
        const zip = await JSZip.loadAsync(fileData);
        console.log('ZIP parsed successfully');
        
        // Collect all async operations
        const promises = [];
        
        // Iterate through each worksheet
        for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
            const sheetName = workbook.SheetNames[sheetIndex];
            console.log(`Processing sheet ${sheetIndex + 1}: ${sheetName}`);
            
            // Try to find drawing files for this sheet
            const drawingPath = `xl/drawings/drawing${sheetIndex + 1}.xml`;
            const vmlDrawingPath = `xl/drawings/vmlDrawing${sheetIndex + 1}.vml`;
            
            // Check for modern drawings (shapes, textboxes)
            const drawingFile = zip.file(drawingPath);
            if (drawingFile) {
                console.log(`  Found drawing file: ${drawingPath}`);
                const promise = drawingFile.async('string').then(xmlContent => {
                    const texts = extractTextsFromDrawingXML(xmlContent, sheetName);
                    console.log(`  Extracted ${texts.length} texts from drawing XML`);
                    shapes.push(...texts);
                }).catch(err => console.error('Drawing parsing error:', err));
                promises.push(promise);
            } else {
                console.log(`  No drawing file found: ${drawingPath}`);
            }
            
            // Check for VML drawings (legacy shapes)
            const vmlFile = zip.file(vmlDrawingPath);
            if (vmlFile) {
                console.log(`  Found VML file: ${vmlDrawingPath}`);
                const promise = vmlFile.async('string').then(vmlContent => {
                    const texts = extractTextsFromVML(vmlContent, sheetName);
                    console.log(`  Extracted ${texts.length} texts from VML`);
                    shapes.push(...texts);
                }).catch(err => console.error('VML parsing error:', err));
                promises.push(promise);
            } else {
                console.log(`  No VML file found: ${vmlDrawingPath}`);
            }
        }
        
        // Wait for all async operations to complete
        console.log(`Waiting for ${promises.length} async operations...`);
        await Promise.all(promises);
        console.log(`All operations complete. Total shapes extracted: ${shapes.length}`);
        
    } catch (error) {
        console.error('Error extracting shapes:', error);
    }
    
    return shapes;
}

// Load JSZip library dynamically
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (window.JSZip) {
            resolve(window.JSZip);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Extract text from drawing XML
function extractTextsFromDrawingXML(xmlContent, sheetName) {
    const texts = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Find all text elements (a:t tags)
    const textElements = xmlDoc.getElementsByTagName('a:t');
    
    for (let i = 0; i < textElements.length; i++) {
        const text = textElements[i].textContent.trim();
        if (text) {
            texts.push({
                sheet: sheetName,
                type: 'shape',
                text: text,
                location: `シート: ${sheetName}, オブジェクト #${texts.length + 1}`
            });
        }
    }
    
    return texts;
}

// Extract text from VML
function extractTextsFromVML(vmlContent, sheetName) {
    const texts = [];
    
    // Simple regex to extract text from VML
    const textMatches = vmlContent.matchAll(/<div[^>]*>(.*?)<\/div>/gs);
    
    for (const match of textMatches) {
        const text = match[1].replace(/<[^>]*>/g, '').trim();
        if (text) {
            texts.push({
                sheet: sheetName,
                type: 'vml',
                text: text,
                location: `シート: ${sheetName}, VMLオブジェクト #${texts.length + 1}`
            });
        }
    }
    
    return texts;
}

// Display extracted texts
function displayExtractedTexts(shapes) {
    const container = document.getElementById('extractedTexts');
    
    if (shapes.length === 0) {
        container.innerHTML = '<p class="text-gray-500">オブジェクト内のテキストが見つかりませんでした</p>';
        return;
    }
    
    let html = '<div class="space-y-3">';
    shapes.forEach((shape, index) => {
        html += `
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        ${index + 1}
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-600 mb-2">${shape.location}</p>
                        <p class="text-gray-800 whitespace-pre-wrap">${escapeHtml(shape.text)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    document.getElementById('resultsSection').classList.remove('hidden');
}

// Check text with Gemini AI
async function checkTextWithGemini(shapes) {
    if (!apiKey) {
        alert('APIキーが設定されていません');
        return;
    }
    
    const resultsContainer = document.getElementById('errorResults');
    resultsContainer.innerHTML = '<p class="text-gray-500">解析中...</p>';
    
    try {
        const allErrors = [];
        
        // Check each shape's text
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            updateLoadingMessage(`AI解析中... (${i + 1}/${shapes.length})`);
            
            const errors = await analyzeTextForErrors(shape.text, shape.location);
            if (errors && errors.length > 0) {
                allErrors.push({
                    shape: shape,
                    errors: errors,
                    index: i + 1
                });
            }
        }
        
        // Display results
        displayErrorResults(allErrors);
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        resultsContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-600">エラーが発生しました: ${error.message}</p>
                <p class="text-sm text-red-500 mt-2">APIキーが正しいか確認してください</p>
            </div>
        `;
    }
}

// Analyze text for errors using Gemini
async function analyzeTextForErrors(text, location) {
    const prompt = `以下のテキストを解析し、誤字脱字があれば指摘してください。
IVR（自動音声応答システム）の設定シートで使用されるテキストです。

テキスト:
"""
${text}
"""

以下の形式でJSON配列として回答してください（問題がなければ空配列）:
[
  {
    "error": "誤りのあるテキスト部分",
    "suggestion": "修正案",
    "reason": "指摘理由"
  }
]

注意事項:
- 誤字脱字、タイプミス、明らかな文法ミスのみを指摘してください
- 専門用語や固有名詞は誤字として指摘しないでください
- JSON形式以外の文章は出力しないでください`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
            }
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    const resultText = data.candidates[0]?.content?.parts[0]?.text || '[]';
    
    // Extract JSON from response
    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    
    return [];
}

// Display error results
function displayErrorResults(allErrors) {
    const container = document.getElementById('errorResults');
    
    if (allErrors.length === 0) {
        container.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-green-700 font-semibold mt-3">誤字脱字は見つかりませんでした</p>
                <p class="text-green-600 text-sm mt-1">すべてのテキストは正常です</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p class="text-yellow-800 font-semibold">⚠️ ${allErrors.length}件の指摘があります</p>
        </div>
        <div class="space-y-6">
    `;
    
    allErrors.forEach(item => {
        html += `
            <div class="border-l-4 border-red-500 bg-white rounded-lg shadow-sm p-6">
                <div class="flex items-start gap-3 mb-4">
                    <div class="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-semibold">
                        ${item.index}
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800 mb-1">${item.shape.location}</h3>
                        <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">${escapeHtml(item.shape.text)}</p>
                    </div>
                </div>
                
                <div class="space-y-3 ml-11">
        `;
        
        item.errors.forEach((error, errorIndex) => {
            html += `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex gap-2 mb-2">
                        <span class="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded">指摘 ${errorIndex + 1}</span>
                    </div>
                    <div class="space-y-2">
                        <div>
                            <p class="text-xs text-gray-600 mb-1">❌ 誤り:</p>
                            <p class="text-red-700 font-medium">${escapeHtml(error.error)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-600 mb-1">✅ 修正案:</p>
                            <p class="text-green-700 font-medium">${escapeHtml(error.suggestion)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-600 mb-1">💡 理由:</p>
                            <p class="text-gray-700">${escapeHtml(error.reason)}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Utility functions
function showLoading(message) {
    document.getElementById('loadingMessage').textContent = message;
    document.getElementById('loadingSection').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingSection').classList.add('hidden');
}

function updateLoadingMessage(message) {
    document.getElementById('loadingMessage').textContent = message;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
