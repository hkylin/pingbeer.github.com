﻿(function (c, f) {
    var s = c.document;
    var b = s.documentElement;
    var m = s.querySelector('meta[name="viewport"]');
    var n = s.querySelector('meta[name="flexible"]');
    var a = 0;
    var r = 0;
    var l;
    var d = f.flexible || (f.flexible = {});
    if (m) {
        var e = m.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        if (e) {
            r = parseFloat(e[1]);
            a = parseInt(1 / r)
        }
    } else {
        if (n) {
            var j = n.getAttribute("content");
            if (j) {
                var q = j.match(/initial\-dpr=([\d\.]+)/);
                var h = j.match(/maximum\-dpr=([\d\.]+)/);
                if (q) {
                    a = parseFloat(q[1]);
                    r = parseFloat((1 / a).toFixed(2))
                }
                if (h) {
                    a = parseFloat(h[1]);
                    r = parseFloat((1 / a).toFixed(2))
                }
            }
        }
    }
    if (!a && !r) {
        var p = c.navigator.appVersion.match(/android/gi);
        var o = c.navigator.appVersion.match(/iphone/gi);
        var k = c.devicePixelRatio;
        if (o) {
            if (k >= 3 && (!a || a >= 3)) {
                a = 3
            } else {
                if (k >= 2 && (!a || a >= 2)) {
                    a = 2
                } else {
                    a = 1
                }
            }
        } else {
            a = 1
        }
        r = 1 / a
    }
    b.setAttribute("data-dpr", a);
    if (!m) {
        m = s.createElement("meta");
        m.setAttribute("name", "viewport");
        m.setAttribute("content", "initial-scale=" + r + ", maximum-scale=" + r + ", minimum-scale=" + r + ", user-scalable=no");
        if (b.firstElementChild) {
            b.firstElementChild.appendChild(m)
        } else {
            var g = s.createElement("div");
            g.appendChild(m);
            s.write(g.innerHTML)
        }
    }
    function i() {
        var t = b.getBoundingClientRect().width;
        if (t / a > 540) {
            t = 540 * a
        }
        var u = t / 10;
        b.style.fontSize = u + "px";
        d.rem = c.rem = u
    }

    c.addEventListener("resize", function () {
        clearTimeout(l);
        l = setTimeout(i, 300)
    }, false);
    c.addEventListener("pageshow", function (t) {
        if (t.persisted) {
            clearTimeout(l);
            l = setTimeout(i, 300)
        }
    }, false);
    if (s.readyState === "complete") {
        s.body.style.fontSize = 16 * a + "px"
    } else {
        s.addEventListener("DOMContentLoaded", function (t) {
            s.body.style.fontSize = 16 * a + "px"
        }, false)
    }
    i();
    d.dpr = c.dpr = a;
    d.refreshRem = i;
    d.rem2px = function (u) {
        var t = parseFloat(u) * this.rem;
        if (typeof u === "string" && u.match(/rem$/)) {
            t += "px"
        }
        return t
    };
    d.px2rem = function (u) {
        var t = parseFloat(u) / this.rem;
        if (typeof u === "string" && u.match(/px$/)) {
            t += "rem"
        }
        return t
    }
})(window, window["lib"] || (window["lib"] = {}));