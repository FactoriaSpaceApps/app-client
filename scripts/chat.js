document.addEventListener('DOMContentLoaded', (event) => {
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const responseElement = document.getElementById('response');
    const audioPlayer = document.getElementById('audioPlayer');
    const chatInputContainer = document.getElementById('chat-input-container');
    const chatToggleButton = document.getElementById('chatToggleButton');
    const chatbotAvatar = document.getElementById('asistente');

    // Toggle chat input functionality
    chatToggleButton.addEventListener('click', function() {
        const isVisible = chatInputContainer.style.display !== 'none';
        
        if (isVisible) {
            // Hide chat input
            chatInputContainer.style.display = 'none';
            sendButton.style.display = 'none';
            chatToggleButton.classList.remove('active');
            chatToggleButton.innerHTML = '💬';
        } else {
            // Show chat input
            chatInputContainer.style.display = 'flex';
            sendButton.style.display = 'block';
            chatToggleButton.classList.add('active');
            chatToggleButton.innerHTML = '✖️';
            input.focus();
        }
    });

    sendButton.addEventListener('click', function (e) {
        e.preventDefault();
        const message = input.value.trim();
        if (message) {
            responseElement.innerHTML = 'Procesando...';
            chatbotAvatar.classList.add('listening');
            
            fetch('https://webextendida.es/chatOso.php?question=' + encodeURIComponent(message), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.text())
            .then(text => {
                input.value = '';
                responseElement.innerHTML = text;
                chatbotAvatar.classList.remove('listening');
                chatbotAvatar.classList.add('speaking');
                
                const formData = new URLSearchParams();
                formData.append('text', text);

                // Definir la función async que hará la solicitud fetch
                async function fetchAudio() {
                    try {
                        const response = await fetch('https://webextendida.es/chatOsoAudio.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: formData.toString()
                        });
                
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                
                        const audioBlob = await response.blob();
                        const audioUrl = URL.createObjectURL(audioBlob);
                        audioPlayer.src = audioUrl;
                        
                        // Play audio and handle speaking animation
                        audioPlayer.onplay = function() {
                            chatbotAvatar.classList.add('speaking');
                        };
                        
                        audioPlayer.onended = function() {
                            chatbotAvatar.classList.remove('speaking');
                        };
                        
                        audioPlayer.play();
                    } catch (error) {
                        console.error('Error generating audio:', error);
                        chatbotAvatar.classList.remove('speaking');
                    }
                }

                // Llamar la función async
                fetchAudio();
            })
            .catch((error) => {
                console.error('Error:', error);
                responseElement.innerHTML = 'Ocurrió un error: ' + error.message;
                chatbotAvatar.classList.remove('listening', 'speaking');
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const voiceInput = document.getElementById('chat-input');
    const microphoneButton = document.getElementById('microphoneButton');
    const responseElement = document.getElementById('response');
    const audioPlayer = document.getElementById('audioPlayer');
    const chatbotAvatar = document.getElementById('asistente');

    // Verifica si el navegador soporta la API de Web Speech
    if (!('webkitSpeechRecognition' in window)) {
        console.warn('Tu navegador no soporta la API de reconocimiento de voz.');
        microphoneButton.style.display = 'none';
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';

    recognition.onstart = function() {
        microphoneButton.classList.add('recording');
        chatbotAvatar.classList.add('listening');
        responseElement.innerHTML = 'Escuchando...';
    };

    recognition.onend = function() {
        microphoneButton.classList.remove('recording');
        chatbotAvatar.classList.remove('listening');
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        responseElement.innerHTML = 'Procesando: "' + transcript + '"';
        
        // Process the voice input directly
        fetch('https://webextendida.es/chatOso.php?question=' + encodeURIComponent(transcript), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.text())
        .then(text => {
            responseElement.innerHTML = text;
            chatbotAvatar.classList.add('speaking');
            
            const formData = new URLSearchParams();
            formData.append('text', text);

            // Generate and play audio response
            async function fetchAudio() {
                try {
                    const response = await fetch('https://webextendida.es/chatOsoAudio.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData.toString()
                    });
            
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
            
                    const audioBlob = await response.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);
                    audioPlayer.src = audioUrl;
                    
                    // Play audio and handle speaking animation
                    audioPlayer.onplay = function() {
                        chatbotAvatar.classList.add('speaking');
                    };
                    
                    audioPlayer.onended = function() {
                        chatbotAvatar.classList.remove('speaking');
                    };
                    
                    audioPlayer.play();
                } catch (error) {
                    console.error('Error generating audio:', error);
                    chatbotAvatar.classList.remove('speaking');
                }
            }

            fetchAudio();
        })
        .catch((error) => {
            console.error('Error:', error);
            responseElement.innerHTML = 'Ocurrió un error: ' + error.message;
            chatbotAvatar.classList.remove('listening', 'speaking');
        });
    };

    microphoneButton.addEventListener('click', function () {
        recognition.start();
    });
});