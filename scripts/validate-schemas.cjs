#!/usr/bin/env node
/**
 * Script de validación de schemas para archivos JSON en public/api
 * 
 * Valida:
 * - db.json contra db.schema.json (índice principal)
 * - db-*.json contra question-bank.schema.json (datasets de preguntas)
 * 
 * Uso: node scripts/validate-schemas.cjs
 */

const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'public', 'api');
const QUESTION_BANK_SCHEMA_FILE = path.join(API_DIR, 'question-bank.schema.json');
const DB_SCHEMA_FILE = path.join(API_DIR, 'db.schema.json');
const DB_INDEX_FILE = path.join(API_DIR, 'db.json');

function getDatasetFiles() {
  const files = fs.readdirSync(API_DIR);
  return files.filter(file => 
    file.startsWith('db-') && 
    file.endsWith('.json') && 
    !file.endsWith('.schema.json')
  );
}

function validateFile(filePath, schema, ajv) {
  const validate = ajv.compile(schema);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(data);
    
    if (valid) {
      return { status: 'valid', errors: null };
    } else {
      return { 
        status: 'invalid', 
        errors: validate.errors.slice(0, 10) // Limit to first 10 errors
      };
    }
  } catch (parseError) {
    return { 
      status: 'parse_error', 
      errors: parseError.message 
    };
  }
}

function printResult(file, result) {
  if (result.status === 'valid') {
    console.log(`✅ ${file}`);
  } else if (result.status === 'invalid') {
    console.log(`❌ ${file}`);
    for (const err of result.errors) {
      console.log(`   Path: ${err.instancePath || '(root)'}`);
      console.log(`   Error: ${err.message}`);
      if (err.params) {
        console.log(`   Details: ${JSON.stringify(err.params)}`);
      }
      console.log('');
    }
  } else {
    console.log(`❌ ${file} - JSON parse error: ${result.errors}`);
  }
}

function main() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  
  let allValid = true;
  
  // Validate db.json
  console.log('Validating database index file...\n');
  if (!fs.existsSync(DB_SCHEMA_FILE)) {
    console.error(`❌ Schema file not found: ${DB_SCHEMA_FILE}`);
    process.exit(1);
  }
  if (!fs.existsSync(DB_INDEX_FILE)) {
    console.error(`❌ Database index file not found: ${DB_INDEX_FILE}`);
    process.exit(1);
  }
  
  const dbSchema = JSON.parse(fs.readFileSync(DB_SCHEMA_FILE, 'utf8'));
  const dbResult = validateFile(DB_INDEX_FILE, dbSchema, ajv);
  printResult('db.json', dbResult);
  if (dbResult.status !== 'valid') {
    allValid = false;
  }
  
  // Validate dataset files (db-*.json)
  console.log('\nValidating dataset files...\n');
  if (!fs.existsSync(QUESTION_BANK_SCHEMA_FILE)) {
    console.error(`❌ Schema file not found: ${QUESTION_BANK_SCHEMA_FILE}`);
    process.exit(1);
  }

  const questionBankSchema = JSON.parse(fs.readFileSync(QUESTION_BANK_SCHEMA_FILE, 'utf8'));
  const datasetFiles = getDatasetFiles();
  
  if (datasetFiles.length === 0) {
    console.log('⚠️  No dataset files (db-*.json) found to validate.');
  } else {
    console.log(`Found ${datasetFiles.length} dataset file(s) to validate.\n`);

    for (const file of datasetFiles) {
      const filePath = path.join(API_DIR, file);
      const result = validateFile(filePath, questionBankSchema, ajv);
      printResult(file, result);
      if (result.status !== 'valid') {
        allValid = false;
      }
    }
  }

  console.log('');
  if (allValid) {
    console.log('✅ All files are valid!');
    process.exit(0);
  } else {
    console.log('❌ Some files have validation errors.');
    process.exit(1);
  }
}

main();
