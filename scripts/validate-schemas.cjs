#!/usr/bin/env node
/**
 * Script de validación de schemas para archivos db-*.json
 * 
 * Valida que todos los archivos db-*.json (excepto db.json) cumplan con
 * el schema consolidado question-bank.schema.json.
 * 
 * Uso: node scripts/validate-schemas.cjs
 */

const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'public', 'api');
const SCHEMA_FILE = path.join(API_DIR, 'question-bank.schema.json');

// Archivos a excluir de la validación (no son datasets de preguntas)
const EXCLUDE_FILES = ['db.json'];

function getDatasetFiles() {
  const files = fs.readdirSync(API_DIR);
  return files.filter(file => 
    file.startsWith('db-') && 
    file.endsWith('.json') && 
    !file.endsWith('.schema.json') &&
    !EXCLUDE_FILES.includes(file)
  );
}

function main() {
  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`❌ Schema file not found: ${SCHEMA_FILE}`);
    process.exit(1);
  }

  const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const datasetFiles = getDatasetFiles();
  
  if (datasetFiles.length === 0) {
    console.log('⚠️  No dataset files (db-*.json) found to validate.');
    process.exit(0);
  }

  console.log(`Validating ${datasetFiles.length} dataset file(s) against question-bank.schema.json...\n`);

  let allValid = true;
  const results = [];

  for (const file of datasetFiles) {
    const filePath = path.join(API_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const valid = validate(data);
      
      if (valid) {
        results.push({ file, status: 'valid', errors: null });
      } else {
        results.push({ 
          file, 
          status: 'invalid', 
          errors: validate.errors.slice(0, 10) // Limit to first 10 errors
        });
        allValid = false;
      }
    } catch (parseError) {
      results.push({ 
        file, 
        status: 'parse_error', 
        errors: parseError.message 
      });
      allValid = false;
    }
  }

  // Print results
  for (const result of results) {
    if (result.status === 'valid') {
      console.log(`✅ ${result.file}`);
    } else if (result.status === 'invalid') {
      console.log(`❌ ${result.file}`);
      for (const err of result.errors) {
        console.log(`   Path: ${err.instancePath || '(root)'}`);
        console.log(`   Error: ${err.message}`);
        if (err.params) {
          console.log(`   Details: ${JSON.stringify(err.params)}`);
        }
        console.log('');
      }
    } else {
      console.log(`❌ ${result.file} - JSON parse error: ${result.errors}`);
    }
  }

  console.log('');
  if (allValid) {
    console.log('✅ All dataset files are valid!');
    process.exit(0);
  } else {
    console.log('❌ Some dataset files have validation errors.');
    process.exit(1);
  }
}

main();
