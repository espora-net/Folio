import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DOCS_BASE_PATH = path.join(process.cwd(), 'docs');

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const segments = params?.path ?? [];
  const requestedPath = segments.join('/');

  if (!requestedPath) {
    return NextResponse.json(
      { error: 'Ruta de documento no especificada' },
      { status: 400 }
    );
  }

  const normalized = path.normalize(requestedPath);
  const absolutePath = path.join(DOCS_BASE_PATH, normalized);

  if (!absolutePath.startsWith(DOCS_BASE_PATH)) {
    return NextResponse.json(
      { error: 'Acceso al documento no permitido' },
      { status: 400 }
    );
  }

  try {
    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Documento no encontrado' },
      { status: 404 }
    );
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
  const content = fs.readFileSync(absolutePath);

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${path.basename(absolutePath)}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
