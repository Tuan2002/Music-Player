fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        const songList = data.songs;
        const $ = document.querySelector.bind(document);
        const $$ = document.querySelectorAll.bind(document);
        const leftSidebars = $$('.left__side-bar__items .side-bar__item');
        const controlPlayModes = {
            repeat: $('.music-control__repeat-btn'),
            shuffle: $('.music-control__shuffle-btn'),
        }
        const audio = $('.audio');
        const cdRotation = $('.music-info__disk').animate([
            { transform: 'rotate(360deg)' }
        ], { duration: 10000, iterations: Infinity, });
        const USER_SETTING = 'USER_MUSIC_SETTING';
        const settngs = JSON.parse(localStorage.getItem(USER_SETTING)) || {};
        let isShuffle;
        let isRepeat;
        let isPlaying = false;
        let songListLength = songList.length;
        let currentIndex = settngs.currentIndex || 0;

        cdRotation.pause();
        leftSidebars.forEach(function (item) {
            item.addEventListener('click', (e) => {
                $('.left__side-bar__items .side-bar__item.active').classList.remove('active');
                item.classList.add('active');
            });
        }
        );

        for (var i in controlPlayModes) {
            controlPlayModes[i].addEventListener('click', function (e) {
                this.classList.toggle('active');
                if (e.target.classList.contains('music-control__shuffle-btn')) {
                    isShuffle = !isShuffle;
                    setUserSetting('isShuffle', isShuffle);
                }
                if (e.target.classList.contains('music-control__repeat-btn')) {
                    isRepeat = !isRepeat;
                    setUserSetting('isRepeat', isRepeat);
                }
            });
        }

        function loadSetting() {
            const repeatBtn = $('.music-control__repeat-btn');
            const shuffleBtn = $('.music-control__shuffle-btn');
            if (settngs.isRepeat) {
                isRepeat = true;
                repeatBtn.classList.add('active');
            }
            if (settngs.isShuffle) {
                isShuffle = true;
                console.log(settngs.isShuffle);
                shuffleBtn.classList.add('active');
            }
        }

        function setUserSetting(key, value) {
            settngs[key] = value;
            localStorage.setItem(USER_SETTING, JSON.stringify(settngs));
        }

        function handleClickPlay() {
            const playBtn = $('.music-control__play-btn');
            playBtn.addEventListener('click', () => {
                isPlaying = !isPlaying;
                if (isPlaying) {
                    playBtn.innerText = 'pause_circle_outline';
                    audio.play();
                    cdRotation.play();
                }
                else {
                    playBtn.innerText = 'play_circle_outline';
                    audio.pause();
                    cdRotation.pause();
                }
            });
        }

        const playList = $('.right__side-bar__content');
        function renderPlayList() {
            const renderContent = songList.map((song) => {
                return `                   
        <div id="${song.id}" class="side-bar__item pd-8">
            <div class="side-bar__item__avatar">
                <img src=${song.thumb}
                    alt="" class="side-bar__item__image">
            </div>
            <div class="side-bar__item__info">
                <h4 class="item-info__name">${song.name}</h4>
                <span class="item-info__author">${song.singer}</span>
            </div>
            <div class="side-bar__item_more-btn material-icons">more_vert</div>
    </div>`
            })
            playList.innerHTML = renderContent.join('');
        }

        function handlePlayAudio() {
            var currentSong = songList[currentIndex];
            const playingSongName = $('.music-info__name');
            const cdRotate = $('.music-info__disk');
            playingSongName.innerText = currentSong.name;
            cdRotate.style.backgroundImage = `url(${currentSong.thumb})`;
            audio.src = currentSong.path;
            if (isPlaying) {
                audio.play();
            }
            else {
                audio.pause();
            }
            handleActiveSong();
            setUserSetting('currentIndex', currentIndex);
        }

        function handleClickNext() {
            const nextBtn = $('.music-control__next-btn');
            nextBtn.addEventListener('click', () => {
                if (isShuffle) {
                    currentIndex = Math.floor(Math.random() * songListLength);
                }
                else {
                    currentIndex++;
                    if (currentIndex > songListLength - 1) {
                        currentIndex = 0;
                    }
                }
                handlePlayAudio();
            }
            );
        }
        function handleClickPrev() {
            const prevBtn = $('.music-control__prev-btn');
            prevBtn.addEventListener('click', () => {
                if (isShuffle) {
                    currentIndex = Math.floor(Math.random() * songListLength);
                }
                else {
                    currentIndex--;
                    if (currentIndex < 0) {
                        currentIndex = songListLength - 1;
                    }
                }
                handlePlayAudio();
            }
            );
        }

        const timeLine = $('.music-timeline');
        function handleRenderTime() {
            const currentTime = $('.music-timer__current-time');
            const leftTime = $('.music-timer__left-time');
            function formatTime(time) {
                var minutes = Math.floor(time / 60);
                var seconds = Math.floor(time % 60);
                if (seconds < 10) {
                    seconds = '0' + seconds;
                }
                return minutes + ':' + seconds;
            }
            audio.onloadeddata = () => {
                currentTime.innerText = formatTime(0);
                leftTime.innerText = formatTime(audio.duration);
            };

            audio.addEventListener('timeupdate', () => {
                if (audio.currentTime > 0) {
                    timeLine.value = audio.currentTime / audio.duration * 100;
                }
                if (audio.duration) {
                    currentTime.innerText = formatTime(audio.currentTime);
                    leftTime.innerText = formatTime(audio.duration - audio.currentTime);
                }
                else {
                    leftTime.innerText = "Đang tải...";
                }
            }
            );
        }

        function handleSeekTime() {
            timeLine.addEventListener('input', () => {
                audio.currentTime = timeLine.value / 100 * audio.duration;
            }
            );
        }

        function handleAutoPlay() {
            audio.addEventListener('ended', () => {
                if (isRepeat) {
                    audio.play();
                }
                else {
                    if (isShuffle) {
                        currentIndex = Math.floor(Math.random() * songListLength);
                        handlePlayAudio();
                    }
                    else {
                        currentIndex++;
                        if (currentIndex > songListLength - 1) {
                            currentIndex = 0;
                        }
                        handlePlayAudio();
                    }
                }
            }
            );
        }

        function handleActiveSong() {
            const songElement = $$('.right__side-bar__content .side-bar__item');
            songElement.forEach(function (item) {
                if (item.id == currentIndex + 1) {
                    const activingSong = $('.right__side-bar__content .side-bar__item.active');
                    const isOtherActive = !!activingSong;
                    if (isOtherActive) {
                        activingSong.classList.remove('active');
                    }
                    item.classList.add('active');
                    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                }
            })
        }

        function handleClickOnSong() {
            playList.addEventListener('click', (event) => {
                const target = event.target;
                if (target.closest('.side-bar__item') && !target.classList.contains('side-bar__item_more-btn')) {
                    currentIndex = target.closest('.side-bar__item').id - 1;
                    handlePlayAudio();
                }
            });
        }


        function app() {
            loadSetting();
            renderPlayList();
            handlePlayAudio();
            handleClickPlay();
            handleClickNext();
            handleClickPrev();
            handleRenderTime();
            handleSeekTime();
            handleAutoPlay();
            handleClickOnSong();

        }
        app();
    });