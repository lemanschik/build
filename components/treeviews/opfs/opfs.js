/** OPFS TreeView **/

 let fileHandles = [];
  let directoryHandles = [];

  const getDirectoryEntriesRecursive = async (
    directoryHandle,
    relativePath = '.',
  ) => {
    const entries = {};
    // Get an iterator of the files and folders in the directory.
    const directoryIterator = directoryHandle.values();
    const directoryEntryPromises = [];
    for await (const handle of directoryIterator) {
      const nestedPath = `${relativePath}/${handle.name}`;
      if (handle.kind === 'file') {
        fileHandles.push({ handle, nestedPath });
        directoryEntryPromises.push(
          handle.getFile().then((file) => {
            return {
              name: handle.name,
              kind: handle.kind,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              relativePath: nestedPath,
            };
          }),
        );
      } else if (handle.kind === 'directory') {
        directoryHandles.push({ handle, nestedPath });
        directoryEntryPromises.push(
          (async () => {
            return {
              name: handle.name,
              kind: handle.kind,
              relativePath: nestedPath,
              entries: await getDirectoryEntriesRecursive(handle, nestedPath),
            };
          })(),
        );
      }
    }
    const directoryEntries = await Promise.all(directoryEntryPromises);
    directoryEntries.forEach((directoryEntry) => {
      entries[directoryEntry.name] = directoryEntry;
    });
    return entries;
  };

  const getFileHandle = (path) => {
    return fileHandles.find((element) => {
      return element.nestedPath === path;
    });
  };

  const getDirectoryHandle = (path) => {
    return directoryHandles.find((element) => {
      return element.nestedPath === path;
    });
  };

const router = new WritableStream({
  async write([request,sender,sendResponse]){
    if (request.message === 'getDirectoryEntriesRecursive') {
      fileHandles = [];
      directoryHandles = [];
      const directory = {
        '.': {
          kind: 'directory',
          relativePath: '.',
          entries: await getDirectoryEntriesRecursive(
            await navigator.storage.getDirectory()
          ),
        },
      };
      sendResponse({ directory: rootEntrie });
    } else if (request.message === 'saveFile') {
      const fileHandle = getFileHandle(request.data).handle;
      try {
        const handle = await showSaveFilePicker({
          suggestedName: fileHandle.name,
        });
        const writable = await handle.createWritable();
        await writable.write(await fileHandle.getFile());
        await writable.close();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error.name, error.message);
        }
      }
    } else if (request.message === 'deleteFile') {
      const fileHandle = getFileHandle(request.data).handle;
      try {
        await fileHandle.remove();
        sendResponse({ result: 'ok' });
      } catch (error) {
        console.error(error.name, error.message);
        sendResponse({ error: error.message });
      }
    } else if (request.message === 'deleteDirectory') {
      const directoryHandle = getDirectoryHandle(request.data).handle;
      try {
        await directoryHandle.remove({ recursive: true });
        sendResponse({ result: 'ok' });
      } catch (error) {
        console.error(error.name, error.message);
        sendResponse({ error: error.message });
      }
    }
  },
});
  
// worker
new ReadableStream({start(c){globalThis.message =
  ({data: request})=> c.enqueue([request,globalThis,(msg)=>globalThis.postMessage(msg)])}
}).pipeTo(router):

// sharedWorker
new ReadableStream({start(c){globalThis.onconnect =
  ({ports:[port]})=>(port.onmessage=(request)=>c.enqueue([request,port,(msg)=>port.postMessage(msg)])}
}).pipeTo(router):

// Browser Extension
new ReadableStream({
start:(c)=>(chrome || browser).runtime.onMessage.addListener(
(request, sender, sendResponse) => {
  c.enqeue(request, sender, sendResponse);
  return true;
}),
}).pipeTo(router);
 

