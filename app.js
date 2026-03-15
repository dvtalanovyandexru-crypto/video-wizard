// ===== Wizard State =====
let currentStep = 1;
const totalSteps = 9;
let wizardData = {};

// ===== Voice Options =====
const voiceOptions = {
    'adam': { name: 'Adam', desc: 'Уверенный, глубокий', preview: 'Привет! Я Adam, и я готов озвучить ваш проект.' },
    'antoni': { name: 'Antoni', desc: 'Мягкий, дружелюбный', preview: 'Привет! Я Antoni, приятно познакомиться!' },
    'josh': { name: 'Josh', desc: 'Энергичный, молодой', preview: 'Йо! Josh на связи, поехали!' },
    'michael': { name: 'Michael', desc: 'Авторитетный, зрелый', preview: 'Здравствуйте. Michael к вашим услугам.' },
    'bella': { name: 'Bella', desc: 'Тёплый, спокойный', preview: 'Привет, я Bella. Буду рада помочь.' },
    'rachel': { name: 'Rachel', desc: 'Профессиональный', preview: 'Добрый день. Rachel готова к работе.' },
    'elli': { name: 'Elli', desc: 'Энергичный, молодой', preview: 'Привет! Elli на связи!' },
    'matilda': { name: 'Matilda', desc: 'Драматичный, выразительный', preview: 'Здравствуйте. Matilda ждёт ваших текстов.' }
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initWizard();
    initUploadZones();
    initFormListeners();
    updateProgressBar();
});

// ===== Wizard Navigation =====
function initWizard() {
    showStep(1);
}

function showStep(step) {
    document.querySelectorAll('.wizard-step').forEach((el, index) => {
        el.classList.remove('active');
        if (index + 1 === step) {
            el.classList.add('active');
        }
    });
    
    currentStep = step;
    document.getElementById('currentStepNum').textContent = step;
    updateProgressBar();
    
    // Update character names in voice selection
    if (step === 7) {
        updateVoiceCharacterNames();
    }
    
    // Update summary on last step
    if (step === 9) {
        generateSummary();
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        saveStepData(currentStep);
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('mainProgressBar').style.width = `${progress}%`;
}

// ===== Data Management =====
function saveStepData(step) {
    const stepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
    const inputs = stepEl.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                wizardData[input.name] = input.value;
            }
        } else if (input.type === 'checkbox') {
            if (!wizardData[input.name]) {
                wizardData[input.name] = [];
            }
            if (input.checked) {
                if (!wizardData[input.name].includes(input.value)) {
                    wizardData[input.name].push(input.value);
                }
            } else {
                wizardData[input.name] = wizardData[input.name].filter(v => v !== input.value);
            }
        } else if (input.type === 'file') {
            if (input.files.length > 0) {
                wizardData[input.id] = input.files[0];
            }
        } else {
            wizardData[input.id || input.name] = input.value;
        }
    });
}

// ===== Upload Zones =====
function initUploadZones() {
    const uploadZones = document.querySelectorAll('.upload-zone');
    
    uploadZones.forEach(zone => {
        const input = zone.querySelector('input[type="file"]');
        const placeholder = zone.querySelector('.upload-placeholder');
        const preview = zone.querySelector('.upload-preview');
        
        // Click to upload
        zone.addEventListener('click', (e) => {
            if (e.target.closest('.voice-preview-btn')) return;
            input.click();
        });
        
        // File selected
        input.addEventListener('change', () => {
            handleFileSelect(input.files[0], zone, preview);
        });
        
        // Drag & drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            input.files = e.dataTransfer.files;
            handleFileSelect(file, zone, preview);
        });
    });
}

function handleFileSelect(file, zone, preview) {
    if (!file) return;
    
    const placeholder = zone.querySelector('.upload-placeholder');
    
    // Show preview
    preview.innerHTML = `
        <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline" onclick="removeFile(this)">✕</button>
    `;
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.insertBefore(img, preview.firstChild);
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        preview.insertBefore(video, preview.firstChild);
    }
    
    placeholder.classList.add('hidden');
    preview.classList.remove('hidden');
}

function removeFile(btn) {
    const preview = btn.closest('.upload-preview');
    const zone = preview.closest('.upload-zone');
    const input = zone.querySelector('input[type="file"]');
    const placeholder = zone.querySelector('.upload-placeholder');
    
    input.value = '';
    preview.innerHTML = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== Form Listeners =====
function initFormListeners() {
    // Radio and checkbox cards
    document.querySelectorAll('.radio-card input, .checkbox-card input').forEach(input => {
        input.addEventListener('change', updateCardStyles);
    });
    
    // Model cards
    document.querySelectorAll('.model-card input').forEach(input => {
        input.addEventListener('change', updateModelCardStyles);
    });
    
    // Voice cards
    document.querySelectorAll('.voice-card input').forEach(input => {
        input.addEventListener('change', updateVoiceCardStyles);
    });
    
    // Range inputs
    document.querySelectorAll('.form-range').forEach(range => {
        range.addEventListener('input', (e) => {
            const valueDisplay = e.target.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('range-value')) {
                valueDisplay.textContent = e.target.value + 'x';
            }
        });
    });
    
    // Character count change
    document.querySelectorAll('input[name="characterCount"]').forEach(radio => {
        radio.addEventListener('change', updateCharacterFields);
    });
}

function updateCardStyles(e) {
    const card = e.target.closest('.radio-card, .checkbox-card');
    const name = e.target.name;
    
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
        const otherCard = input.closest('.radio-card, .checkbox-card');
        if (otherCard) {
            otherCard.classList.remove('checked');
        }
    });
    
    if (e.target.checked) {
        card.classList.add('checked');
    }
}

function updateModelCardStyles(e) {
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('checked');
    });
    e.target.closest('.model-card').classList.add('checked');
}

function updateVoiceCardStyles(e) {
    const voiceAssignment = e.target.closest('.voice-assignment');
    if (voiceAssignment) {
        voiceAssignment.querySelectorAll('.voice-card').forEach(card => {
            card.classList.remove('checked');
        });
    }
    e.target.closest('.voice-card').classList.add('checked');
}

// ===== Dialogue Editor =====
function addDialogueLine() {
    const editor = document.getElementById('dialogueEditor');
    const line = document.createElement('div');
    line.className = 'dialogue-line';
    line.innerHTML = `
        <input type="text" class="speaker-input" placeholder="Имя персонажа">
        <input type="text" class="line-input" placeholder="Текст реплики...">
    `;
    editor.appendChild(line);
}

// ===== Character Fields =====
function updateCharacterFields(e) {
    const count = parseInt(e.target.value);
    const container = document.getElementById('charactersUpload');
    
    // Add or remove cards based on count
    let currentCards = container.querySelectorAll('.character-upload-card');
    while (currentCards.length < count) {
        const newCard = createCharacterCard(currentCards.length + 1);
        container.appendChild(newCard);
        currentCards = container.querySelectorAll('.character-upload-card');
    }
    
    while (currentCards.length > count) {
        currentCards[currentCards.length - 1].remove();
        currentCards = container.querySelectorAll('.character-upload-card');
    }
}

function createCharacterCard(num) {
    const card = document.createElement('div');
    card.className = 'character-upload-card';
    card.dataset.character = num;
    card.innerHTML = `
        <h4>Персонаж ${num}</h4>
        <div class="media-upload-zones">
            <div class="upload-zone media-zone">
                <input type="file" accept="image/*" class="photo-input" hidden>
                <div class="upload-placeholder small">
                    <span class="upload-icon">📷</span>
                    <p>Фото лица</p>
                    <span class="upload-hint">JPG, PNG</span>
                </div>
                <div class="upload-preview hidden"></div>
            </div>
            <div class="upload-zone media-zone">
                <input type="file" accept="video/*" class="video-input" hidden>
                <div class="upload-placeholder small">
                    <span class="upload-icon">🎥</span>
                    <p>Видео-референс</p>
                    <span class="upload-hint">MP4, MOV</span>
                </div>
                <div class="upload-preview hidden"></div>
            </div>
        </div>
        <input type="text" class="character-name-input" placeholder="Имя персонажа">
        <textarea class="character-desc-input" placeholder="Описание персонажа..."></textarea>
    `;
    
    // Initialize upload for new card
    const zones = card.querySelectorAll('.upload-zone');
    zones.forEach(zone => {
        const input = zone.querySelector('input[type="file"]');
        const preview = zone.querySelector('.upload-preview');
        
        zone.addEventListener('click', () => input.click());
        input.addEventListener('change', () => handleFileSelect(input.files[0], zone, preview));
    });
    
    return card;
}

// ===== Voice Preview =====
function previewVoice(voiceId) {
    const voice = voiceOptions[voiceId];
    if (!voice) return;
    
    // In a real implementation, this would call ElevenLabs API
    alert(`Прослушивание голоса ${voice.name}:\n"${voice.preview}"\n\n(В реальной версии здесь будет воспроизведение аудио)`);
}

// ===== Update Voice Character Names =====
function updateVoiceCharacterNames() {
    const characterInputs = document.querySelectorAll('.character-name-input');
    const assignedNames = document.querySelectorAll('.assigned-name');
    
    characterInputs.forEach((input, index) => {
        if (assignedNames[index]) {
            const name = input.value.trim() || `Персонаж ${index + 1}`;
            assignedNames[index].textContent = name;
        }
    });
}

// ===== Summary Generation =====
function generateSummary() {
    // Collect all data
    const scriptText = document.getElementById('scriptText')?.value || 'Не указан';
    const interiorDesc = document.getElementById('interiorDescription')?.value || 'Не указан';
    const characterCount = document.querySelector('input[name="characterCount"]:checked')?.value || '2';
    const videoModel = document.querySelector('input[name="videoModel"]:checked')?.closest('.model-card')?.querySelector('.model-card-name')?.textContent || 'Kling 3';
    const ttsModel = document.querySelector('input[name="ttsModel"]:checked')?.closest('.model-card')?.querySelector('.model-card-name')?.textContent || 'Multilingual v2';
    const duration = document.querySelector('input[name="duration"]:checked')?.value || '10';
    const aspectRatio = document.querySelector('input[name="aspectRatio"]:checked')?.value || '16:9';
    const sceneCount = document.querySelector('input[name="sceneCount"]:checked')?.value || '1';
    const lighting = document.querySelector('input[name="lighting"]:checked')?.value || 'natural';
    const quality = document.querySelector('input[name="quality"]:checked')?.value || 'standard';
    
    const summaryHTML = `
        <div class="summary-item">
            <span class="summary-label">Сценарий</span>
            <span class="summary-value">${scriptText.substring(0, 50)}${scriptText.length > 50 ? '...' : ''}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Интерьер</span>
            <span class="summary-value">${interiorDesc.substring(0, 30)}${interiorDesc.length > 30 ? '...' : 'Не указан'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Персонажей</span>
            <span class="summary-value">${characterCount}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Модель видео</span>
            <span class="summary-value">${videoModel}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Модель озвучки</span>
            <span class="summary-value">${ttsModel}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Длительность</span>
            <span class="summary-value">${duration} сек</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Формат</span>
            <span class="summary-value">${aspectRatio}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Сцен</span>
            <span class="summary-value">${sceneCount}</span>
        </div>
    `;
    
    document.getElementById('projectSummary').innerHTML = summaryHTML;
    
    // Update time estimation
    updateTimeEstimation(videoModel, parseInt(duration), parseInt(sceneCount));
}

function updateTimeEstimation(videoModel, duration, scenes) {
    const videoTime = videoModel.includes('Kling') ? 3 : 2;
    const totalVideoTime = videoTime * scenes;
    const ttsTime = Math.ceil(duration / 10);
    const syncTime = 2;
    const total = totalVideoTime + ttsTime + syncTime;
    
    document.getElementById('timeEstimation').innerHTML = `
        <li>Видео (${videoModel}, ${duration} сек, ${scenes} сц.): <strong>${totalVideoTime}-${totalVideoTime + 2} мин</strong></li>
        <li>Озвучка диалога: <strong>${ttsTime} мин</strong></li>
        <li>Синхронизация: <strong>${syncTime} мин</strong></li>
        <li class="total">Итого: <strong>~${total}-${total + 4} минут</strong></li>
    `;
}

// ===== Save Draft =====
function saveDraft() {
    saveStepData(currentStep);
    
    const draft = {
        timestamp: new Date().toISOString(),
        data: wizardData
    };
    
    localStorage.setItem('videoDirectorDraft', JSON.stringify(draft));
    alert('Черновик сохранён! Вы можете вернуться к нему позже.');
}

// ===== Launch Generation =====
async function launchGeneration() {
    saveStepData(currentStep);
    
    const apiKey = document.getElementById('apiKeyApiInOne').value;
    const webhookUrl = document.getElementById('n8nWebhook').value;
    
    if (!apiKey) {
        alert('Пожалуйста, введите API ключ');
        return;
    }
    
    if (!webhookUrl) {
        alert('Пожалуйста, введите URL webhook n8n');
        return;
    }
    
    // Show status modal
    const modal = document.getElementById('statusModal');
    modal.classList.remove('hidden');
    
    // Prepare payload
    const payload = preparePayload(apiKey);
    
    try {
        updateStatus('sending', 'Отправка данных...', 10);
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.executionId || data.jobId) {
            updateStatus('processing', 'Генерация запущена! Отслеживаем прогресс...', 30);
            pollGenerationStatus(data.executionId || data.jobId, webhookUrl);
        } else {
            showResults(data);
        }
        
    } catch (error) {
        updateStatus('error', 'Ошибка: ' + error.message, 0);
        console.error('Generation error:', error);
    }
}

function preparePayload(apiKey) {
    const videoModel = document.querySelector('input[name="videoModel"]:checked')?.value || 'kling-3';
    const ttsModel = document.querySelector('input[name="ttsModel"]:checked')?.value || 'eleven-multilingual-v2';
    const duration = document.querySelector('input[name="duration"]:checked')?.value || '10';
    const aspectRatio = document.querySelector('input[name="aspectRatio"]:checked')?.value || '16:9';
    const sceneCount = document.querySelector('input[name="sceneCount"]:checked')?.value || '1';
    const lighting = document.querySelector('input[name="lighting"]:checked')?.value || 'natural';
    const quality = document.querySelector('input[name="quality"]:checked')?.value || 'standard';
    
    // Collect character data
    const characters = [];
    document.querySelectorAll('.character-upload-card').forEach((card, index) => {
        const name = card.querySelector('.character-name-input')?.value || `Character ${index + 1}`;
        const desc = card.querySelector('.character-desc-input')?.value || '';
        const photoInput = card.querySelector('.photo-input');
        const videoInput = card.querySelector('.video-input');
        
        characters.push({
            id: index + 1,
            name: name,
            description: desc,
            hasPhoto: photoInput && photoInput.files.length > 0,
            hasVideo: videoInput && videoInput.files.length > 0
        });
    });
    
    // Collect dialogue
    const dialogue = [];
    document.querySelectorAll('.dialogue-line').forEach(line => {
        const speaker = line.querySelector('.speaker-input')?.value;
        const text = line.querySelector('.line-input')?.value;
        if (speaker && text) {
            dialogue.push({ speaker, text });
        }
    });
    
    // Collect camera angles
    const cameraAngles = [];
    document.querySelectorAll('input[name="cameraAngles"]:checked').forEach(cb => {
        cameraAngles.push(cb.value);
    });
    
    return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        
        // Content
        script: {
            text: document.getElementById('scriptText')?.value || '',
            interior: document.getElementById('interiorDescription')?.value || ''
        },
        
        dialogue: dialogue,
        characters: characters,
        
        // Styling
        styling: {
            clothing: document.getElementById('clothingDesc')?.value || '',
            lighting: lighting,
            colorPalette: document.querySelector('input[name="colorPalette"]:checked')?.value || 'neutral',
            poses: document.getElementById('posesDesc')?.value || '',
            extraInstructions: document.getElementById('extraInstructions')?.value || ''
        },
        
        // Video settings
        video: {
            model: videoModel,
            provider: videoModel.startsWith('openrouter') ? 'openrouter' : 'apiinone',
            duration: parseInt(duration),
            aspectRatio: aspectRatio,
            sceneCount: parseInt(sceneCount),
            cameraAngles: cameraAngles,
            quality: quality
        },
        
        // Audio settings
        audio: {
            model: ttsModel,
            provider: 'elevenlabs',
            speechSpeed: parseFloat(document.querySelector('input[name="speechSpeed"]')?.value || '1.0'),
            voiceStability: parseFloat(document.querySelector('input[name="voiceStability"]')?.value || '0.5'),
            voices: {
                character1: document.querySelector('input[name="voice1"]:checked')?.value || 'adam',
                character2: document.querySelector('input[name="voice2"]:checked')?.value || 'antoni'
            }
        },
        
        // Credentials
        credentials: {
            apiInOne: apiKey,
            elevenLabs: document.getElementById('apiKeyElevenLabs')?.value || apiKey
        }
    };
}

// ===== Polling & Status =====
async function pollGenerationStatus(jobId, baseUrl) {
    const maxAttempts = 60;
    let attempts = 0;
    
    const checkStatus = async () => {
        attempts++;
        
        try {
            const response = await fetch(`${baseUrl}/status/${jobId}`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                updateStatus('completed', 'Готово!', 100);
                setTimeout(() => showResults(data), 500);
                return;
            } else if (data.status === 'failed') {
                updateStatus('error', 'Ошибка генерации: ' + data.error, 0);
                return;
            }
            
            // Update progress
            const progress = Math.min(30 + (attempts * 1), 95);
            updateStatus('processing', `Генерация... ${data.stage || 'Обработка'}`, progress);
            
            if (attempts < maxAttempts) {
                setTimeout(checkStatus, 5000);
            } else {
                updateStatus('warning', 'Генерация занимает больше времени. Проверьте n8n напрямую.', 100);
            }
            
        } catch (error) {
            updateStatus('error', 'Ошибка проверки статуса: ' + error.message, 0);
        }
    };
    
    setTimeout(checkStatus, 3000);
}

function updateStatus(type, message, progress) {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const msg = document.getElementById('statusMessage');
    const bar = document.getElementById('generationProgressBar');
    
    const icons = {
        sending: '📤',
        processing: '⚙️',
        completed: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    icon.textContent = icons[type] || '⏳';
    title.textContent = type === 'completed' ? 'Готово!' : 
                       type === 'error' ? 'Ошибка' : 
                       type === 'warning' ? 'Внимание' : 'Генерация...';
    msg.textContent = message;
    bar.style.width = `${progress}%`;
}

function showResults(data) {
    const linksDiv = document.getElementById('resultLinks');
    linksDiv.classList.remove('hidden');
    
    let linksHTML = '';
    
    if (data.videoUrl) {
        linksHTML += `<a href="${data.videoUrl}" target="_blank" class="result-link">🎬 Скачать видео</a>`;
    }
    if (data.audioUrl) {
        linksHTML += `<a href="${data.audioUrl}" target="_blank" class="result-link">🎵 Скачать аудио</a>`;
    }
    if (data.projectUrl) {
        linksHTML += `<a href="${data.projectUrl}" target="_blank" class="result-link">📁 Открыть проект</a>`;
    }
    
    linksDiv.innerHTML = linksHTML || '<p>Результаты будут доступны в n8n</p>';
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        if (currentStep < totalSteps) nextStep();
    } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        if (currentStep > 1) prevStep();
    }
});

// ===== Load Draft on Start =====
window.addEventListener('load', () => {
    const draft = localStorage.getItem('videoDirectorDraft');
    if (draft) {
        const data = JSON.parse(draft);
        const hoursSince = (Date.now() - new Date(data.timestamp)) / (1000 * 60 * 60);
        
        if (hoursSince < 24 && confirm('Найден сохранённый черновик. Загрузить?')) {
            loadDraft(data.data);
        }
    }
});

function loadDraft(data) {
    // Restore form values
    Object.entries(data).forEach(([key, value]) => {
        const input = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = input.value === value;
            } else {
                input.value = value;
            }
        }
    });
    
    wizardData = data;
    alert('Черновик загружен!');
}
