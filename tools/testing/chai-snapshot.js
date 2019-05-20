/**
 * @fileOverview
 * As original chai-karma-snapshot package requires the preprocessing (is using commonjs), can it be used in this setup.
 * This is very simple replacement of this plugin.
 */

function snapshotPath(node) {
    var path = [];
    while (node && node.parent) {
        path.push(node.title);
        node = node.parent;
    }
    return path.reverse();
}

function matchSnapshot(chai) {
    var context = window.__mocha_context__;
    var snapshotState = window.__snapshot__;

    chai.util.addMethod(chai.Assertion.prototype, "matchSnapshot", aMethodForExpect);
    chai.assert.matchSnapshot = aMethodForAssert;

    function aMethodForAssert(lang, update, msg) {
        // This basically wraps the 'expect' version of the assertion to allow using 'assert' syntax.
        return new chai.Assertion(lang, update, msg).to.matchSnapshot();
    }

    function aMethodForExpect(lang, update) {
        var obj = chai.util.flag(this, "object");
        var index = context.index++;
        var path;

        // For a hook, use the currentTest for path
        if (context.runnable.type === "hook") {
            path = snapshotPath(context.runnable.ctx.currentTest);
        } else {
            path = snapshotPath(context.runnable);
        }

        if (update || snapshotState.update) {
            snapshotState.set(path, index, obj, lang);
        } else {
            var snapshot = snapshotState.get(path, index);
            if (!snapshot) {
                snapshotState.set(path, index, obj, lang);
            } else {
                if (!snapshotState.match(obj, snapshot.code)) {
                    throw new chai.AssertionError("Received value does not match stored snapshot " + index, {
                        actual: obj,
                        expected: snapshot.code,
                        showDiff: true
                    }, chai.util.flag(this, "ssfi"));
                }
            }
        }
    }
}

matchSnapshot(window.chai);
