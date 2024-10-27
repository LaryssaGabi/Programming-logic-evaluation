const tar = require('tar');
const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

/**
 * Utility function to map over a generator.
 *
 * @param {Generator} generator - The input generator.
 * @param {Function} mapFn - The mapping function.
 * @returns {Generator} - The mapped generator.
 */
function* mapGenerator(generator, mapFn) {
  for (const value of generator) {
    yield mapFn(value);
  }
}

/**
 * Utility function to filter a generator.
 *
 * @param {Generator} generator - The input generator.
 * @param {Function} filterFn - The filtering function.
 * @returns {Generator} - The filtered generator.
 */
function* filterGenerator(generator, filterFn) {
  for (const value of generator) {
    if (filterFn(value)) {
      yield value;
    }
  }
}

/**
 * Utility function to compose multiple functions.
 *
 * @param {...Function} fns - The functions to compose.
 * @returns {Function} - The composed function.
 */
const pipe = (input, ...fns) => fns.reduce((acc, fn) => fn(acc), input);

/**
 * Walk through a directory and yield file paths.
 *
 * @param {string} dir - The directory to walk through.
 * @param {number} depth - Current depth in the directory structure.
 * @yields {string} - The file path.
 */
function* walk(dir, depth = 0) {
  const maxDepth = 5; // Defina um limite para a profundidade
  console.log(`Caminhando pelo diretório: ${dir}`);

  // Ignorar node_modules na primeira camada
  if (depth === 0 && path.basename(dir) === 'node_modules') {
    console.log(`Ignorando a pasta: ${dir}`);
    return; 
  }

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules em qualquer profundidade
      if (file === 'node_modules') {
        console.log(`Ignorando a pasta: ${filePath}`);
        continue; 
      }
      console.log(`Entrando na pasta: ${filePath}`); // Log para indicar que estamos entrando em uma pasta
      yield* walk(filePath, depth + 1);
    } else {
      console.log(`Arquivo encontrado: ${filePath}`); // Log para cada arquivo encontrado
      yield filePath;
    }
  }
}

/**
 * Get the list of files to include in the tarball, excluding those ignored by
 * .gitignore.
 *
 * @returns {string[]} - The list of files to include.
 */
const getFilesToInclude = () => {
  const ig = ignore();
  const gitignorePath = path.join(__dirname, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    ig.add(gitignoreContent);
    console.log('.gitignore encontrado. Adicionando regras de ignorar...');
  } else {
    console.log('Nenhum .gitignore encontrado.');
  }

  return pipe(
    walk(__dirname, 0), // Começar na profundidade 0
    files => mapGenerator(files, file => path.relative(__dirname, file)),
    files => filterGenerator(files, file => !ig.ignores(file)),
    files => Array.from(files),
  );
};

/**
 * Ensure the uploads directory exists.
 *
 * @param {string} uploadsDir - The path to the uploads directory.
 */
const ensureUploadsDirExists = uploadsDir => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
};

/**
 * Get the next available tarball name with a numeric increment as a postfix.
 *
 * @param {string} uploadsDir - The path to the uploads directory.
 * @param {string} baseName - The base name of the tarball.
 * @param {string} extension - The extension of the tarball.
 * @returns {string} - The next available tarball name.
 */
const getNextTarballName = (uploadsDir, baseName, extension) => {
  const getTarballName = index => (index === 0 ? `${baseName}${extension}` : `${baseName}-${index}${extension}`);
  let index = 0;
  while (fs.existsSync(path.join(uploadsDir, getTarballName(index)))) {
    index++;
  }
  return getTarballName(index);
};

/** Main function to generate the tarball. */
const main = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  ensureUploadsDirExists(uploadsDir);

  console.log('Obtendo arquivos para incluir no tarball...');
  const filesToInclude = getFilesToInclude();
  console.log('Arquivos finais a serem incluídos:', filesToInclude);

  const baseTarballName = 'upload-me';
  const tarballExtension = '.tar.gz';
  const tarballName = getNextTarballName(uploadsDir, baseTarballName, tarballExtension);
  const tarballPath = path.join(uploadsDir, tarballName);

  tar
    .c(
      {
        gzip: true,
        file: tarballPath,
        cwd: __dirname,
      },
      filesToInclude,
    )
    .then(() => {
      console.log(`Tarball criado: ${tarballName}`);
      console.log(`Você pode abrir o diretório com o tarball aqui: file://${uploadsDir}`);

      import('open').then(open => {
        open.default(uploadsDir);
      });
    })
    .catch(err => {
      console.error('Erro ao criar o tarball:', err);
    });
};

main();
