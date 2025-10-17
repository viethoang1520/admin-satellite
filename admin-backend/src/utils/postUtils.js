require("dotenv").config();
const axios = require("axios");

const generateVariations = async (content) => {
  const prompt = `
  Bạn hãy viết lại nội dung sau thành một biến thể mới với câu chữ khác.
  Yêu cầu:
  - Giữ nguyên toàn bộ thẻ HTML có sẵn trong nội dung gốc (ví dụ <br>, <img ... />).
  - Không được thay đổi link ảnh hoặc alt text trong <img>.
  - Chỉ thay đổi cách diễn đạt câu chữ.
  
  Nội dung gốc: """${content}"""
  `;

  try {
    const res = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    // console.log(res.data.choices[0].message.content)
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return null;
  }

}
module.exports = { generateVariations }