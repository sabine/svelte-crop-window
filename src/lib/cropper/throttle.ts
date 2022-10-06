export function keep_delaying_while_triggered(callback: { (): void; }, delay: number) {
    var timer: number | null = null;
    return function () {
        //console.log(["keep_delaying_while_triggered", timer, callback, limit]);
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(async function () {
            callback();
            timer = null;
        }, delay);
    };
}
