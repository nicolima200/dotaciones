import { execSync } from 'child_process';

try {
  const psScript = `
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead('c:\\Users\\nicol\\Documents\\Proyectos AI\\DOTACIONES UPPL\\Antigravity\\src\\assets\\dj_ausente.docx')
  $entry = $zip.GetEntry('word/document.xml')
  $stream = $entry.Open()
  $reader = New-Object System.IO.StreamReader($stream)
  $xml = $reader.ReadToEnd()
  $reader.Close()
  $stream.Close()
  $zip.Dispose()
  
  $idx = $xml.IndexOf('[APELLIDO]')
  if ($idx -ne -1) {
    echo $xml.Substring($idx - 200, 600)
  } else {
    echo "Not found"
  }
  `;
  const base64Script = Buffer.from(psScript, 'utf16le').toString('base64');
  const output = execSync(`powershell -EncodedCommand ${base64Script}`);
  console.log("XML Context:\n", output.toString().trim());
} catch (e) {
  console.error(e);
}
