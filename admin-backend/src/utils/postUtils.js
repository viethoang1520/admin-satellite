const replaceImagesInContent = (content, newImages = []) => {
  try {
    const matches = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/g);

    if (!matches || matches.length !== newImages.length) {
      throw new Error("Số ảnh và số link cung cấp không khớp");
    }

    let index = 0;
    return content.replace(/src=["']([^"']+)["']/g, () => {
      return `src="${newImages[index++]}"`;
    });

  } catch (error) {
    console.log(error)
    throw new Error("Lỗi khi thay thế ảnh trong nội dung: " + error.message);
  }
}
module.exports = { replaceImagesInContent };