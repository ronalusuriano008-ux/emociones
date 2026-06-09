export class Karaoke {

    constructor(
        audio,
        element,
        lrcText,
        offset = 0
    ) {

        this.audio = audio;
        this.element = element;

        // Offset manual (segundos)
        this.offset = offset;

        // Offset leído del LRC
        this.lrcOffset = 0;

        this.lyrics = this.parseLRC(lrcText);

        this.currentIndex = -1;

        this.isTransitioning = false;

        this.update();
    }

    parseLRC(text) {

        const lyrics = [];

        const lines = text.split('\n');

        for (const line of lines) {

            // [offset:500]
            const offsetMatch =
                line.match(/\[offset:([-\d]+)\]/i);

            if (offsetMatch) {

                this.lrcOffset =
                    parseInt(offsetMatch[1]) / 1000;

                continue;
            }

            const match =
                line.match(
                    /\[(\d+):(\d+(?:\.\d+)?)\](.*)/
                );

            if (!match) continue;

            const min =
                parseInt(match[1]);

            const sec =
                parseFloat(match[2]);

            lyrics.push({

                time:
                    min * 60 + sec,

                text:
                    match[3].trim()

            });

        }

        return lyrics;
    }

    update = () => {

        const t =
            this.audio.currentTime +
            this.offset +
            this.lrcOffset;

        for (
            let i = this.lyrics.length - 1;
            i >= 0;
            i--
        ) {

            if (
                t >= this.lyrics[i].time
            ) {

                if (
                    this.currentIndex !== i
                ) {

                    this.currentIndex = i;

                    this.show(
                        this.lyrics[i].text
                    );
                }

                break;
            }
        }

        requestAnimationFrame(
            this.update
        );
    }

    show(text) {

        if (this.isTransitioning) return;

        this.isTransitioning = true;

        // Fade out
        this.element.style.opacity = '0';

        this.element.style.transform =
            'translate(-50%, -55%) scale(0.90)';

        const onFadeOut = () => {

            this.element.removeEventListener(
                'transitionend',
                onFadeOut
            );

            // Cambiar texto
            this.element.innerHTML = text;

            // Forzar reflow
            void this.element.offsetWidth;

            // Fade in
            this.element.style.opacity = '1';

            this.element.style.transform =
                'translate(-50%, -50%) scale(1)';

            const onFadeIn = () => {

                this.element.removeEventListener(
                    'transitionend',
                    onFadeIn
                );

                this.isTransitioning = false;
            };

            this.element.addEventListener(
                'transitionend',
                onFadeIn,
                { once: true }
            );
        };

        this.element.addEventListener(
            'transitionend',
            onFadeOut,
            { once: true }
        );
    }

    // Adelantar letra
    forward(ms = 100) {

        this.offset += ms / 1000;

        console.log(
            'Offset:',
            this.offset.toFixed(3),
            'segundos'
        );
    }

    // Retrasar letra
    backward(ms = 100) {

        this.offset -= ms / 1000;

        console.log(
            'Offset:',
            this.offset.toFixed(3),
            'segundos'
        );
    }

    setOffset(seconds) {

        this.offset = seconds;

        console.log(
            'Offset fijado:',
            seconds
        );
    }

}