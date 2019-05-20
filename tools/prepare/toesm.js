const fs = require('fs');
const path = require('path');
const config = require(path.join(process.cwd(), 'toesm.config'));

config.modules.forEach((m) => {
    const moduleContent = fs.readFileSync(require.resolve(m.from)).toString();
    let newContent = '',
        requireMap = {},
        exports = '';
    if (m.imports) {
        Object.keys(m.imports).forEach((k, i) => {
            newContent += `import __${i} from "${m.imports[k]}";\n`;
            requireMap[k] = `__${i}`;
        });
    }

    newContent += `const __m = {exports: {}};\n(((require, module) => {\n${moduleContent}\n`+
        `})((k)=> (${JSON.stringify(requireMap, null, 4)}[k]), __m));\nexport default __m.exports;`;

    if (m.exports) {
        (m.exports).forEach((k, i) => {
            newContent += `const ${k} = __m.exports[${k}];\n`;
            exports += `${k}, `;
        });
        newContent += `export {\n${exports}\n}`;
    }
    fs.writeFileSync(
        path.join(process.cwd(), config.outDir, m.to), newContent);
});
