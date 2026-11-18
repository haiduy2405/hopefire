import * as ResEdit from 'resedit'; import * as PE from 'pe-library'; import fs from 'fs';
const exe=PE.NtExecutable.from(fs.readFileSync(process.argv[2]),{ignoreCert:true});const res=PE.NtExecutableResource.from(exe);
const ico=ResEdit.Data.IconFile.from(fs.readFileSync(process.argv[3]));
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries,1,1033,ico.icons.map(i=>i.data));
const vi=ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
vi.setStringValues({lang:1033,codepage:1200},{ProductName:'HOPEFIRE',FileDescription:'HOPEFIRE',CompanyName:'duyluma',LegalCopyright:'(c) 2026 duyluma',OriginalFilename:'HOPEFIRE.exe',InternalName:'HOPEFIRE'});
vi.setFileVersion(0,8,0,0,1033);vi.setProductVersion(0,8,0,0,1033);vi.outputToResourceEntries(res.entries);
res.outputResource(exe);fs.writeFileSync(process.argv[2],Buffer.from(exe.generate()));console.log('ok');
