// =====================================================
//  Google Apps Script — 구글 드라이브 업로드 + 갤러리 백엔드
// =====================================================

var ROOT_FOLDER_ID = '0ABCzjZ6p-FqIUk9PVA';

function doPost(e) {
  try {
    var data   = JSON.parse(e.postData.contents);
    var bytes  = Utilities.base64Decode(data.fileData);
    var blob   = Utilities.newBlob(bytes, data.mimeType, data.fileName);
    var folder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    var file   = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return respond({ status: 'success', name: file.getName(), id: file.getId() });
  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  var action   = e && e.parameter && e.parameter.action;
  var folderId = e && e.parameter && e.parameter.folderId;

  if (action === 'folders') return listFolders();
  if (action === 'list')    return listFiles(folderId || ROOT_FOLDER_ID);

  return ContentService
    .createTextOutput('Upload service OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// 루트 폴더 안의 하위 폴더 목록 반환
function listFolders() {
  try {
    var root    = DriveApp.getFolderById(ROOT_FOLDER_ID);
    var iter    = root.getFolders();
    var result  = [];

    while (iter.hasNext()) {
      var f = iter.next();
      result.push({ id: f.getId(), name: f.getName() });
    }

    result.sort(function(a, b) { return a.name.localeCompare(b.name, 'ko'); });

    return respond({ status: 'success', folders: result });
  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

// 특정 폴더의 사진·동영상 목록 반환
function listFiles(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files  = folder.getFiles();
    var result = [];

    while (files.hasNext()) {
      var f    = files.next();
      var mime = f.getMimeType();
      if (mime.startsWith('image/') || mime.startsWith('video/')) {
        // 갤러리 열람을 위해 공개 보기 권한 부여 (없으면 추가)
        try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(_) {}
        result.push({
          id:       f.getId(),
          name:     f.getName(),
          mimeType: mime,
          date:     f.getDateCreated().toISOString()
        });
      }
    }

    result.sort(function(a, b) { return b.date.localeCompare(a.date); });

    return respond({ status: 'success', files: result });
  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
