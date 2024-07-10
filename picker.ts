 const pickImage = async (fromCamera: boolean) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3] as [number, number],
      quality: 1,
      base64: true,
    };

    let result;

    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      // No permissions request is necessary for launching the image library
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      try {
        const formData = new FormData();
        const timestamp = new Date().toISOString();
        const isIos = Platform.OS === 'ios';
        const fileInfo: any = await FileSystem.getInfoAsync(result.assets[0].uri);

        // Checking if file size is greater than 2MB or not
        if (fileInfo?.size > 2048000) {
          Toast.show({
            type: 'error',
            text1: STRING_CONSTANTS.profile_photo_size_limit_error_title,
            text2: STRING_CONSTANTS.profile_photo_size_limit_error_desc,
          });

          return;
        }

        const fileUri = fileInfo.uri;
        const extension = fileUri.split('.').pop();
        const filemime = mime.getType(fileUri);
        const filename = `profilepic-${timestamp}.${isIos ? 'jpg' : extension}`;

        // @ts-ignore
        formData.append('doc', {
          uri: isIos ? result.assets[0].uri : fileUri,
          type: filemime,
          name: filename,
        });

        const resultUpload = await uploadFile({
          formData: formData,
          docType: ProfileDocumentTypeRaw.Profile,
        });

        if (resultUpload) {
          Toast.show({
            type: 'success',
            text1: 'Profile picture successfully uploaded!',
          });

          resetUser();
          onBack();
        }
      } catch (e) {
        logger.error(e);
      }
    }
  };
