
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function runTest() {
  const testFile = process.argv[2];

  if (!testFile) {
    console.error('Erro: Forneça o caminho para o arquivo de teste TypeScript.');
    console.log('Uso: ts-node scripts/run-test.ts <caminho-do-teste>.ts');
    process.exit(1);
  }

  const outDir = 'build';
  const jsTestFile = path.join(outDir, testFile.replace('src/', '').replace('.ts', '.js'));

  try {
    console.log(`Compilando o projeto TypeScript...`);
    // Usar o tsc do projeto para compilar tudo
    await execAsync('npx tsc');
    console.log('Compilação concluída.');

    console.log(`Executando o teste: ${jsTestFile}...`);
    // Executar o arquivo de teste compilado com node
    const { stdout, stderr } = await execAsync(`node ${jsTestFile}`);

    if (stderr) {
      console.error('Erros durante a execução do teste:');
      console.error(stderr);
    }

    console.log('Saída do teste:');
    console.log(stdout);

  } catch (error) {
    console.error('Falha ao executar o teste:', error);
    process.exit(1);
  }
}

runTest();
