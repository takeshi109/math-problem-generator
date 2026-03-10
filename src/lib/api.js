/**
 * 生成した TeX 文字列をサーバーに送り、PDF をダウンロードする
 */
export const downloadPdfFromServer = async (texString, fileName = "math_print.pdf") => {
  try {
    // 【ここを修正】自分のPCで動いている Python サーバーを宛先にします
    const API_ENDPOINT = "http://127.0.0.1:5000/generate-pdf";

    console.log(" ローカルサーバーに TeX データを送信中...");

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tex: texString }),
    });

    if (!response.ok) {
      throw new Error("PDF の生成に失敗しました。");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "math_print.tex"; 
    
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    window.URL.revokeObjectURL(url);
    console.log(" PDF のダウンロードが開始されました。");

  } catch (error) {
    console.error(" エラーが発生しました:", error);
    alert("PDF サーバーとの通信に失敗しました。Pythonサーバー(pdf_server.py)が起動しているか確認してください。");
  }
};