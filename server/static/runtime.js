export class valueObj {
    constructor(_v, symbolIndex, symbolRef) {
        this._v = _v;
        this.symbolIndex = symbolIndex;
        this.symbolRef = symbolRef;
    }
    set v(v) {
        var _a;
        if (this._v === v)
            return;
        this._v = v;
        this.symbolRef[0] = this.symbolIndex | this.symbolRef[0];
        if (!this.symbolRef[1]) {
            Promise.resolve().then((_a = this.symbolRef[2]) === null || _a === void 0 ? void 0 : _a.bind(this));
            this.symbolRef[1] = true;
        }
    }
    get v() {
        return this._v;
    }
}
export function genUpdateFunc(updElm) {
    return function () {
        if (this.symbolRef[1]) {
            updElm();
            this.symbolRef[0] = 0;
            this.symbolRef[1] = false;
        }
    };
}
export function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return String(text).replace(/[&<>"']/g, function (m) {
        return map[m];
    });
}
export function replaceText(content, elm) {
    elm.innerHTML = escapeHtml(content);
}
export function replaceAttr(key, content, elm) {
    if (content === undefined && elm.hasAttribute(key)) {
        elm.removeAttribute(key);
        return;
    }
    elm[key] = String(content);
}
export function reactiveValue(v, symbolIndex, symbolRef) {
    return new valueObj(v, symbolIndex, symbolRef);
}
export function addEvListener(elm, evName, evFunc) {
    elm.addEventListener(evName, evFunc);
}
export function getElmRefs(ids, preserveId) {
    return ids.map((id, index) => {
        const e = document.getElementById(id);
        (Math.pow(2, index)) & preserveId && e.removeAttribute("id");
        return e;
    });
}
export function insertEmpty(parent, anchor) {
    const empty = document.createTextNode(" ");
    parent.insertBefore(empty, anchor);
    return empty;
}
