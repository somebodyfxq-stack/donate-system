import {useState, useCallback, useEffect} from 'react';
import { api } from '../services/api';
import widgetEnum from '../enums/widgetEnum';
import { messageService } from '../services/messageService';
import helpers from './helpers';

export const UPLOAD_LIMIT = 200;
export const MAX_FILE_SIZE = 30;

export const useFileInteraction = (userFileType) => {
  const [alreadyUploaded, setAlreadyUploaded] = useState(0);
  const [files, setFiles] = useState({
    images: [],
    sounds: []
  });

  const getUserFilesHandler = useCallback(async () => {
    const data = await api.getFiles(userFileType);
    const userFiles = {
      images: [],
      sounds: []
    };
    data.forEach((item) => {
      if (item.fileType.indexOf('image') >= 0 || item.fileType.indexOf('video') >= 0) {
        userFiles.images.push(item);
      } else {
        userFiles.sounds.push(item);
      }
    })

    userFiles.images = [...userFiles.images, ...widgetEnum.images()]
    userFiles.sounds = [...userFiles.sounds, ...widgetEnum.sounds()]

    setAlreadyUploaded(data.length)
    setFiles({...userFiles})
  }, [userFileType])

  useEffect(() => {
    getUserFilesHandler()
  }, [getUserFilesHandler])

  const uploadHandler = useCallback(async (e, item, userFileType) => {
    let file = e.target.files[0];

    if (!file.type) {
      return;
    }

    if (file.size / 1024 / 1024 >= MAX_FILE_SIZE) {
      messageService.success(`Файл занадто великий (максимум ${MAX_FILE_SIZE} мб)`);
      return;
    }

    if (alreadyUploaded >= UPLOAD_LIMIT) {
      messageService.success(`Перевищено максимальну кількість файлів (${UPLOAD_LIMIT})`);
      return;
    }

    const isCorrectFileType = (file.type.indexOf('image') !== -1 && item === 'images') ||
      (file.type.indexOf('video') !== -1 && item === 'images') ||
      (file.type.indexOf('audio') !== -1 && item === 'sounds');

    if (isCorrectFileType) {
      messageService.success('Відвантаження файлу');

      const req = new XMLHttpRequest();
      const formData = new FormData();
      const sanitazedFileName = helpers.sanitazeFileName(file.name);

      formData.append("fileToUpload", file, sanitazedFileName);

      req.open("POST", `/panel-api/file?userFileType=${userFileType}`);
      req.send(formData);
      req.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          const responce = JSON.parse(this.response);
          const userFiles = {...files};

          userFiles[item].unshift(responce)

          messageService.success('Файл завантажений');

          setAlreadyUploaded(alreadyUploaded+1)

          setFiles({...userFiles})
        }
      };
    } else {
      messageService.success('Неправильний тип файлу');
    }

  }, [alreadyUploaded, files])

  const removeFile = useCallback(async (fileName, itemName) => {
    await api.deleteFile({ name: fileName })
    const userFiles = {...files};
    userFiles[itemName] = userFiles[itemName].filter((item) => item.name !== fileName);

    messageService.success('Файл видалений');

    if (itemName === 'sounds') {
      setFiles({
        images: [],
        sounds: []
      }); // we need it to refresh sound html
    }

    setFiles({...userFiles});
  }, [files])

  return {
    files,
    alreadyUploaded,
    getUserFilesHandler,
    uploadHandler,
    removeFile,
  }
}
