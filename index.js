const remark = require('remark');
const visit = require('unist-util-visit');
const is = require('unist-util-is');
const pangu = require('pangu');

/**
 * 参考：https://github.com/VincentBel/remark-pangu
 */

function format(value) {
    if (!value) return value;
    return pangu.spacing(value)
}

let tableStarted = false; // table标签开始
function visitor(node) {
    if (node.value === '<table>') {
        tableStarted = true;
    }
    if (node.value === '</table>') {
        tableStarted = false;
    }
    if (tableStarted) {
        if (is('text', node)) {
            node.value = node.value.replace(/\\/g, '\');
            node.value = node.value.replace(/\[/g, '[');
            node.value = node.value.replace(/\*/g, '*');
        }
        return;
    }

    if (is('text', node)) {
        node.value = format(node.value)
    }

    if (is('link', node) || is('image', node) || is('definition', node)) {
        node.title = format(node.title)
    }

    if (is('image', node) || is('imageReference', node)) {
        node.alt = format(node.alt)
    }
}

function attacher() {
    return function transformer(tree, file) {
        visit(tree, visitor)
    }
}

hexo.extend.filter.register('before_post_render', function (data) {
    remark().use(attacher).process(data.title, (err, file) => {
        data.title = String(file);
    });
    remark().use(attacher).process(data.content, (err, file) => {
        data.content = String(file);
    });
});