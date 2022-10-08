export function keep_delaying_while_triggered(callback: { (): void }, delay: number) {
    var timer: number | null = null;
    return function () {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(async function () {
            callback();
            timer = null;
        }, delay);
    };
}
