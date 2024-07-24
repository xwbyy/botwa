const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const typingIndicator = document.getElementById('typing-indicator');
const body = document.body;

const resetTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const maxLimit = 30;
const redeemCode = 'VynaaCantikBanget';
const scriptPassword = 'GO4KSUBS';

document.addEventListener('DOMContentLoaded', () => {
    loadChat();
    resetDailyLimit();
    loadMode();
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    addMessage('user', message);
    saveChat('user', message);
    chatInput.value = '';

    setTimeout(() => {
        handleCommand(message);
    }, 500);
}

function addMessage(sender, text, thumbnail = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);

    if (thumbnail) {
        const thumbnailElement = document.createElement('img');
        thumbnailElement.src = thumbnail;
        thumbnailElement.classList.add('thumbnail');
        messageElement.appendChild(thumbnailElement);
    }

    const textElement = document.createElement('div');
    textElement.innerHTML = text;
    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleCommand(command) {
    const user = getUser();

    if (command.startsWith('.daftar')) {
        const [_, nameAge] = command.split(' ');
        const [name, age] = nameAge.split('.');
        if (name && age) {
            saveUser({ name, age, limit: maxLimit, ip: 'undefined' });
            addMessage('bot', 'Pendaftaran berhasil.');
        } else {
            addMessage('bot', 'Format salah. Silahkan daftar dengan cara ketik .daftar nama.umur');
        }
        return;
    }

    if (command === '.my') {
        if (user) {
            addMessage('bot', `Nama: ${user.name}<br>Umur: ${user.age}<br>Limit: ${user.limit}<br>IP: ${user.ip}`);
        } else {
            addMessage('bot', 'Anda belum terdaftar.');
        }
        return;
    }

    if (user) {
        if (user.limit <= 0) {
            addMessage('bot', 'Limit Anda habis. Silahkan tunggu 24 jam untuk reset limit.');
            return;
        }

        if (command === '.redemcode') {
            addMessage('bot', 'Masukkan kode:');
            const redeem = prompt('Masukkan kode:');
            if (redeem === redeemCode) {
                if (user.redeemed) {
                    addMessage('bot', 'Kode sudah digunakan.');
                } else {
                    user.limit += 10;
                    user.redeemed = true;
                    saveUser(user);
                    addMessage('bot', 'Kode berhasil digunakan. Limit Anda bertambah 10.');
                }
            } else {
                addMessage('bot', 'Kode salah.');
            }
            return;
        }

        if (command === '.tiktok' || command === '.instagram') {
            addMessage('bot', `Masukkan URL video ${command === '.tiktok' ? 'TikTok' : 'Instagram'}:`);
            return;
        }

        if (command.startsWith('.tiktok ')) {
            const url = command.split(' ')[1];
            handleVideoDownload('tiktok', url);
            return;
        }

        if (command.startsWith('.instagram ')) {
            const url = command.split(' ')[1];
            handleVideoDownload('instagram', url);
            return;
        }

        if (command === '.reels') {
            addMessage('bot', 'Masukkan URL video Reels:');
            return;
        }

        if (command.startsWith('.reels ')) {
            const url = command.split(' ')[1];
            handleVideoDownload('reels', url);
            return;
        }
        
        if (command.startsWith('.simi ')) {
            const message = command.split(' ').slice(1).join(' ');
            handleSimSimi(message);
            return;
        }
    } else {
        addMessage('bot', 'Silahkan daftar terlebih dahulu dengan format: .daftar nama.umur');
    }
}

async function handleSimSimi(message) {
    typingIndicator.style.display = 'block';
    try {
        const response = await fetch(`https://api.agatz.xyz/api/simsimi?message=${encodeURIComponent(message)}`);
        const data = await response.json();
        addMessage('bot', data.data);
    } catch (error) {
        addMessage('bot', 'Terjadi kesalahan saat menghubungi API SimSimi.');
    } finally {
        typingIndicator.style.display = 'none';
    }
}

function saveChat(sender, message) {
    const chat = { sender, message, timestamp: Date.now() };
    localStorage.setItem('chat', JSON.stringify([...getChat(), chat]));
}

function loadChat() {
    const chat = getChat();
    chat.forEach(({ sender, message }) => addMessage(sender, message));
}

function getChat() {
    return JSON.parse(localStorage.getItem('chat') || '[]');
}

function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

function resetChat() {
    localStorage.removeItem('chat');
    chatMessages.innerHTML = '';
}

function resetDailyLimit() {
    const lastReset = localStorage.getItem('lastReset');
    const now = Date.now();

    if (!lastReset || now - lastReset >= resetTime) {
        const user = getUser();
        if (user) {
            user.limit = maxLimit;
            saveUser(user);
        }
        localStorage.setItem('lastReset', now.toString());
    }
}

async function handleVideoDownload(type, url) {
    const user = getUser();
    if (!user) return;

    typingIndicator.style.display = 'block';
    addMessage('bot', `Sedang mendownload video dari ${type}...`);

    try {
        const response = await fetch(`https://api.agatz.xyz/api/download/${type}?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data.status === 200) {
            addMessage('bot', `<a class="button" href="${data.data}" target="_blank">Download Video</a>`);
        } else {
            addMessage('bot', 'Gagal mendownload video.');
        }
    } catch (error) {
        addMessage('bot', 'Terjadi kesalahan saat menghubungi API download.');
    } finally {
        typingIndicator.style.display = 'none';
        user.limit -= 1;
        saveUser(user);
    }
}

function loadMode() {
    const mode = localStorage.getItem('mode') || 'light';
    body.classList.toggle('dark-mode', mode === 'dark');
}

function toggleMode() {
    const isDarkMode = body.classList.toggle('dark-mode');
    localStorage.setItem('mode', isDarkMode ? 'dark' : 'light');
}
