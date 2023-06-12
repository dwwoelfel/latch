import {readFileSync, writeFileSync} from 'fs';
import packageData from './package.json' assert { type: "json" };

import fs from 'fs';
import path from 'path';

function getFiles(directory, fileList = []) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const absolutePath = path.join(directory, file);

    if (fs.statSync(absolutePath).isDirectory()) {
      fileList = getFiles(absolutePath, fileList);
    } else {
      fileList.push(absolutePath);
    }
  });

  return fileList;
}

const files = getFiles('./dist');

for (const file of files) {
  const data = readFileSync(file, 'utf-8');
  const updated = data.replace(/PACKAGE_VERSION/g, packageData.version);
  if (data !== updated) {
    writeFileSync(file, updated, 'utf-8');
  }
}
