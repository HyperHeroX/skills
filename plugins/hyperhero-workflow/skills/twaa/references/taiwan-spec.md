# 網站無障礙規範(110.07) - 十三指引

> 資料來源: [無障礙網路空間服務網](https://accessibility.moda.gov.tw/Accessible/Guide/68#sc111)
> 抓取日期: 2025-11-01

## 概述

為讓網頁開發者能夠對網頁開發在可及性設計的考慮上有明確的指引條文，特參考WAI(Web Accessibility Initiative)組織在相關無障礙網頁標準的設計，以13指引來引導網頁開發者設計可以讓所有人都可以使用的無障礙網頁。

## 十三指引目錄

1. [指引1.1(替代文字)](#指引11替代文字)：為任何非文字的內容提供相等意義的替代文字
2. [指引1.2(時序媒體)](#指引12時序媒體)：針對時序媒體提供替代內容
3. [指引1.3(可調適)](#指引13可調適)：建立能以不同方式呈現的內容
4. [指引1.4(可辨識)](#指引14可辨識)：讓使用者能更容易地看見及聽到內容
5. [指引2.1(鍵盤可操作)](#指引21鍵盤可操作)：讓所有的功能都能透過鍵盤使用
6. [指引2.2(充足時間)](#指引22充足時間)：提供使用者充分的時間來閱讀及使用內容
7. [指引2.3(預防痙攣和身體不適反應)](#指引23預防痙攣和身體不適反應)：不要用任何已知會引發痙攣的方式來設計內容
8. [指引2.4(可導覽)](#指引24可導覽)：提供協助使用者導覽、尋找內容及判斷所在的方法
9. [指引2.5(輸入方式)](#指引25輸入方式)：提供除鍵盤之外其他輸入方式
10. [指引3.1(可讀性)](#指引31可讀性)：讓文字內容可讀並可理解
11. [指引3.2(可預期性)](#指引32可預期性)：讓網頁以可預期的方式來呈現及運作
12. [指引3.3(輸入協助)](#指引33輸入協助)：幫助使用者避開及更正錯誤
13. [指引4.1(相容性)](#指引41相容性)：針對目前及未來的使用者代理與輔助科技，最大化其相容性

---

## 指引1.1：替代文字

**為任何非文字的內容提供相等意義的替代文字，使這些內容能依人們的需求，轉變成大字版、點字、語音、符號或簡化過的語言等不同型態**

### 說明

本指引的目的是要確保所有非文字的內容也都有文字的版本。這裡的「文字」指的是電子文字，而非影像文字。電子文字有著呈現方式中立的獨特優勢，也就是說可以以視覺化、聽覺化、觸覺化等不同方式加以表達，也可同時合用多種表達方式來呈現。因此以電子文字呈現的資訊就可以用任何最適合使用者的方式來呈現。這樣的內容可以很容易地放大、報讀出來讓有閱讀障礙的使用者也能便於理解，或者以任何觸覺的方式呈現來滿足使用者的需求。

### 成功準則1.1.1：非文字內容 (檢測等級A)

- 若非文字的內容是個控制元件或接受使用者輸入的元件，那麼它就會有個用來描述其目的的名稱(這種情況請參考指引4.1)。
- 若非文字的內容是個時序媒體，那麼替代文字至少要為此非文字內容提供描述性的識別資訊(這種情況請參考指引1.2。)
- 若非文字的內容改以文字呈現即會導致測驗或習題無效，那麼替代文字至少要為此非文字內容提供描述性的識別資訊。
- 若非文字的內容主要是為了創造特定的知覺體驗，那麼替代文字至少要為此非文字內容提供描述性的識別資訊。
- 若非文字的內容，是為了要確認取用內容的是人而非電腦，那麼首先要以替代文字來指出及描述此非文字內容的目的，接著還要提供替代的CAPTCHA驗證，採不同感官感知類型的輸出模式，以顧及不同的障礙。
- 若非文字的內容完全只有裝飾作用、僅用於視覺格式排版、或根本不會呈現在使用者面前，那麼就要用輔助科技能加以忽略的方式來實踐。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1499?Category=63) (另開新視窗)

**1.1.1 HM1110100C 圖片組件需有替代文字屬性**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1110100C |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H37 |
| 類別 | HTML |
| 訊息 | 圖片組件需有替代文字屬性 |
| 英文訊息 | H37: Using alt attributes on img elements |
| 規則說明 | 如果alt屬性存在，通過檢測，否則檢測失敗。 |
| 檢測說明 | 若<img>標籤內存在alt屬性且不為空值，則通過檢測。 |
| 範例 | `<img src="screen01.png" alt="從「記事本」的「檔案」選單裡選擇「另存新檔」" />` |
| 說明 | src屬性是設定圖片的URL，也就是圖片的來源位置，alt屬性則是圖片的替代說明文字。 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1500?Category=63) (另開新視窗)

**1.1.1 HM1110101C 影像地圖的區域組件需有替代文字屬性，且其值不得為空字串或空白**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1110101C |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H24 |
| 類別 | HTML |
| 訊息 | 影像地圖的區域組件需有替代文字屬性，且其值不得為空字串或空白 |
| 英文訊息 | H24: Providing text alternatives for the area elements of image maps |
| 規則說明 | 如果<map>標籤中的<area>子標籤組件的alt屬性存在且不為空值，通過檢測，否則檢測失敗。 |
| 檢測說明 | 若<area>標籤內存在alt屬性且不為空值，則通過檢測。 |
| 範例 | `<img src="screen01.png" usemap="#map1" alt="彈出的對話窗有兩個按鈕" />`<br>`<map id="map1" name="map1">`<br>`<area shape="rect" coords="0,0,30,30" href="okbutton.html" alt="確定" />`<br>`<area shape="rect" coords="34,34,100,100" href="cancelbutton.html" alt="取消" />`<br>`</map>` |
| 說明 | <img>標籤中的usemap屬性將圖片定義為客戶端影像地圖，影像地圖指的是帶有可點擊區域的圖片。標籤中的程式碼是將一幅圖片 screen01.png 以<area>標籤劃分 2 個可點擊區域，當用戶單擊其中某一個區域時，將被鏈結到不同的文件中。 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1501?Category=63) (另開新視窗)

**1.1.1 HM1110102C 圖片組件之長描述屬性值需為有效之URI，且其目的資源末端能以超連結回到此圖片組件**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1110102C |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H45 |
| 類別 | HTML |
| 訊息 | 圖片組件之長描述屬性值需為有效之URI，且其目的資源末端能以超連結回到此圖片組件 |
| 英文訊息 | H45: Using longdesc<br>G73: Providing a long description in another location with a link to it that is immediately adjacent to the non-text content<br>G74: Providing a long description in text near the non-text content, with a reference to the location of the long description in the short description |
| 規則說明 | 如果longdesc屬性存在有效之URI且可回到原圖片組件的超連結，通過檢測，否則檢測失敗。 |
| 檢測說明 | 若<img>標籤內longdesc屬性存在有效之URI且src屬性具有此圖片的來源，則通過檢測。 |
| 範例 | `<img longdesc="thispage.html#desc" alt="每一張圖片的描述" src="http://www.company/images/graph.png">`<br>`<div id="desc">`<br>`<h3>長敘述: 圖片敘述</h3>`<br>`<!-- 圖片完整的敘述 -->`<br>`<p>結束長敘述</p>`<br>`</div>` |
| 說明 | 在同一網頁中，<img>標籤的longdesc屬性包含圖片的長描述的錨點URL，<div>標籤則以id屬性定義圖片長的圖片描述在此文件中的位置。 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1503?Category=63) (另開新視窗)

**1.1.1 HM1110104C 型別屬性值為圖片之輸入組件，需有替代文字屬性，且其值不得為空字串或空白**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1110104C |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H36 |
| 類別 | HTML |
| 訊息 | 型別屬性值為圖片之輸入組件，需有替代文字屬性，且其值不得為空字串或空白 |
| 英文訊息 | H36: Using alt attributes on images used as submit buttons |
| 規則說明 | 如果型別為圖片(type="image")的<input>標籤按鈕，標籤內的alt屬性存在且不為空值，通過檢測，否則檢測失敗。 |
| 檢測說明 | 若型別為圖片(type="image")的<input>標籤按鈕，且存在不為空值的alt屬性，則通過檢測。 |
| 範例 | `<form action="http://example.com/prog/text-read" method="post">`<br>`<input type="image" name="submit" src="submit.png" alt="送出" />`<br>`</form>` |
| 說明 | type屬性規定<input>標籤的類型，<input type ="image">定義圖片形式的提交按鈕。當點擊提交按鈕後，數據會傳送到名為"http://example.com/prog/text-read"的頁面。 |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1504?Category=63) (另開新視窗)

**1.1.1 HM1110105C 物件組件需有替代文字內容**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1110105C |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H35 |
| 類別 | HTML |
| 訊息 | 物件組件需有替代文字內容 |
| 英文訊息 | H35: Providing text alternatives on applet elements<br>H46: Using noembed with embed<br>H53: Using the body of the object element |
| 規則說明 | 如果物件組件存在且替代文字、替代物件或替代媒體不為空，通過檢測，否則檢測失敗。物件組件包含<applet>標籤、<embed>標籤、<object>標籤等。 |
| 檢測說明 | 若物件組件未提供替代文字、替代物件或替代媒體說明，則無法通過檢測。 |
| 範例 | **範例1：**<br>`<object ……>`<br>`<object ……>`<br>`<img …… alt="剎那間的真相：小王打了個盹！" />`<br>`你也可以下載MP4格式的影片：`<br>`<a href="truth.mp4">剎那間的真相</a>`<br>`</object>`<br>`</object>`<br><br>**範例2：**<br>`<embed src="../movies/history_of_rome.mov" height="60" width="144" autostart="false">`<br>`<noembed>`<br>`<a href="../transcripts/transcript_history_rome.htm">Transcript of "The history of Rome"</a>`<br>`</noembed>`<br>`</embed>` |
| 說明 | <applet>、<embed>、<object>標籤用於圖片、音頻、視頻、Java applets、ActiveX、PDF及Flash等，<img>標籤與超連結則做為<object>標籤的替代內容。<noembed>標籤則做為<embed>標籤的替代內容。 |

---

##### [範例說明6](https://accessibility.moda.gov.tw/Download/Detail/1505?Category=63) (另開新視窗)

**1.1.1 HM1110106C 替代文字屬性值為空字串的圖片組件，不得有標題屬性**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1110106C |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H67 |
| 類別 | HTML |
| 訊息 | 替代文字屬性值為空字串的圖片組件，不得有標題屬性 |
| 英文訊息 | H67: Using null alt text and no title attribute on img elements for images that AT should ignore |
| 規則說明 | 如果<img>標籤存在空值的alt屬性且不存在title屬性，通過檢測，否則檢測失敗。 |
| 檢測說明 | 若<img>標籤內，alt屬性為空值，且不存在title屬性，則通過檢測。 |
| 範例 | `<img src="squiggle.gif" width="20" height="20" alt="" />` |
| 說明 | 範例為一個做為裝飾用的圖片，src屬性為顯示圖片的來源路徑，width與height屬性分別設定圖片的寬度與高度，alt屬性則為空值。 |

---

##### [範例說明7](https://accessibility.moda.gov.tw/Download/Detail/1533?Category=64) (另開新視窗)

**1.1.1 HM1110100E 圖片需要加上有意義、可代替圖片在文件上下中的功能及內容的替代文字**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110100E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H37 |
| 類別 | HTML |
| 訊息 | 圖片需要加上有意義、可代替圖片在文件上下中的功能及內容的替代文字 |
| 英文訊息 | H37: Using alt attributes on img elements<br>ARIA10: Using aria-labelledby to provide a text alternative for non-text content |
| 規則說明 | 1. 在HTML或XHTML中，若需使圖片加上有意義、可代替圖片在文件中的功能及內容的替代文字，需遵循alt屬性的用法。<br>2. 使用 aria-labelledby屬性提供圖片的替代文字說明。 |
| 檢測說明 | **範例：圖片的替代文字**<br>開啟瀏覽器如Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」。點選選單列中的Accessibility→Text Equivalents→Show Text Equivalents 顯示此圖片的替代文字。 |

---

##### [範例說明8](https://accessibility.moda.gov.tw/Download/Detail/1534?Category=64) (另開新視窗)

**1.1.1 HM1110101E 僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110101E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G196 |
| 類別 | HTML |
| 訊息 | 僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目 |
| 英文訊息 | G196: Using a text alternative on one item within a group of images that describes all items in the group |
| 規則說明 | 在HTML或XHTML中，若在一組連續的圖片中，只有一個圖片項目用替代文字來描述該組圖片的所有項目時，都必須要遵守此指引。 |
| 檢測說明 | 1. 開啟瀏覽器如Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」。<br>2. 點選選單列中的Accessibility→Text Equivalents→Show Text Equivalents來顯示此圖片的替代文字。<br>3. 點選網頁右鍵"檢視原始碼"。<br>4. 可以對照程式碼中，我們可以看到只有第一張圖(img src="w3c1.png")有替代文字(alt="這是w3c網站")，其他圖片項目的替代文字都是空值(alt="")。 |

---

##### [範例說明9](https://accessibility.moda.gov.tw/Download/Detail/1535?Category=64) (另開新視窗)

**1.1.1 HM1110102E 提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110102E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H24 |
| 類別 | HTML |
| 訊息 | 提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的 |
| 英文訊息 | H24: Providing text alternatives for the area elements of image maps<br>ARIA6:Using aria-label to provide labels for objects<br>ARIA15:Using aria-describedby to provide descriptions of images |
| 規則說明 | 提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的 |
| 檢測說明 | **範例1：提供描述影像地圖區域用途的文字**<br>1. 開啟瀏覽器如Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」，顯示替代文字(Accessibility→Text Equivalents→Show Text Equivalents)<br>2. 檢查所有的替代文字是否與其圖片區域原本要表達的功能及意義吻合，必要的時候並參考區域的鏈結目的地來驗證。<br><br>**範例2：利用aria-describedby提供在同一頁面上的詳盡描述**<br>原始碼：<br>`<img src="ladymacbeth.jpg" alt="Lady MacBeth" aria-describedby="p1">`<br>`<p id="p1">This painting dates back to 1730 and is oil on canvas. It was created by Jean-Guy Millome, and represents ...</p>` |

---

##### [範例說明10](https://accessibility.moda.gov.tw/Download/Detail/1536?Category=64) (另開新視窗)

**1.1.1 HM1110103E 圖片無法以替代文字清晰表達時，利用長描述提供更詳盡的說明網頁網址**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110103E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G73 |
| 類別 | HTML |
| 訊息 | 圖片無法以替代文字清晰表達時，利用長描述提供更詳盡的說明網頁網址，利用整個說明網頁的篇幅來詳盡描述，最後並要能連結回原本的圖片 |
| 英文訊息 | G73: Providing a long description in another location with a link to it that is immediately adjacent to the non-text content<br>G74: Providing a long description in text near the non-text content, with a reference to the location of the long description in the short description<br>ARIA15: Using aria-describedby to provide descriptions of images |
| 規則說明 | 任何運用HTML或XHTML提供長描述的網頁，都必須要遵守此指引。 |
| 檢測說明 | **範例 1：長條圖**<br>網頁上有一個長條圖，顯示了排名前三的銷售人員的銷售額。短文本替代內容為："十月份前三名銷售人員的銷售額圖表。詳情請見圖表後的文字："圖表下方的段落如下："10 月份的銷量顯示，瑪麗以 400 台的銷量領先。邁克緊隨其後，銷量為 389 台。克里斯以 350 台的銷量位列第三。"<br><br>**範例 2：標題用作鏈接**<br>這裡有一張圖表。圖表正下方的圖例標題是指向詳細描述的連結。連結的 Title 屬性清楚地表明這是一個指向詳細描述的連結。<br><br>**範例 3：使用aria-describedby描述影像**<br>`<img alt="Lady MacBeth" src="ladymacbeth.jpg" aria-describedby="p1">`<br>`<p id="p1">This painting dates back to 1889 and is oil on canvas. It was created by John Singer Sargent, and represents ...</p>` |

---

##### [範例說明11](https://accessibility.moda.gov.tw/Download/Detail/1537?Category=64) (另開新視窗)

**1.1.1 HM1110104E 提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110104E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H86 |
| 類別 | HTML |
| 訊息 | 提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字，且其替代文字需有意義、可代替前述內容之目的與功能 |
| 英文訊息 | H86: Providing text alternatives for ASCII art, emoticons, and leetspeak |
| 規則說明 | 表情符號或ASCII藝術字可能為任何字元湊成的形狀，故主要用觀察法評鑑。 |
| 檢測說明 | 1. 先判斷出在網頁上由字元湊成的表情符號或ASCII藝術字。<br>2. 接著檢查在表情符號的前後方必須要有等同於符號所要表達意義之文字說明。 |

---

##### [範例說明12](https://accessibility.moda.gov.tw/Download/Detail/1538?Category=64) (另開新視窗)

**1.1.1 HM1110105E 圖片以外的非文字內容需要有替代文字或長描述**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110105E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G82 |
| 類別 | HTML |
| 訊息 | 圖片以外的非文字內容需要有替代文字或長描述，並需具有與該內容或物件相同目的、呈現相同資訊，或者可提供概略描述、俗名、描述性名稱 |
| 英文訊息 | G82: Providing a text alternative that identifies the purpose of the non-text content<br>G92: Providing long description for non-text content that serves the same purpose and presents the same information<br>G94: Providing short text alternative for non-text content that serves the same purpose and presents the same information as the non-text content<br>G95: Providing short text alternatives that provide a brief description of the non-text content<br>G100: Providing a short text alternative which is the accepted name or a descriptive name of the non-text content |
| 規則說明 | 圖片以外的輔助說明，包含表情符號或動畫或影片皆可以此方式檢測。 |
| 檢測說明 | 1. 先判斷出在網頁上由字元湊成的表情符號或ASCII藝術字。<br>2. 用程式碼修改的方式，移除字元表情符號。<br>3. 用程式碼修改的方式，以相等意義之文字取代。 |

---

##### [範例說明13](https://accessibility.moda.gov.tw/Download/Detail/1539?Category=64) (另開新視窗)

**1.1.1 HM1110106E 作為「送出」按鈕之用的圖片需提供替代文字**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110106E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H36 |
| 類別 | HTML |
| 訊息 | 作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能 |
| 英文訊息 | H36: Using alt attributes on images used as submit buttons |
| 規則說明 | 任何運用HTML或XHTML表單元件技術的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 網頁上按右鍵->檢視網頁原始碼<br>2. 檢查input標籤的type屬性是否為"image"(圖片檔)，並檢查是否存在alt屬性，用來表示以圖片做為按鈕的功能。此範例alt屬性表示傳送按鈕，點擊圖片按鈕後會將頁面轉換到所指定的網頁位址。 |

---

##### [範例說明14](https://accessibility.moda.gov.tw/Download/Detail/1540?Category=64) (另開新視窗)

**1.1.1 GN1110107E 提供簡短替代文本描述現場純音訊內容目的及現場純視訊內容目的**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1110107E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G68 |
| 類別 | General |
| 訊息 | 提供可描述現場純音訊內容目的及現場純視訊內容目的的描述性標籤 |
| 英文訊息 | G68: Providing a short text alternative that describes the purpose of live audio-only and live video-only content |
| 規則說明 | 網頁上需有提供現場即時影像或音訊，都必須要遵守此指引。 |
| 檢測說明 | 1. 網頁上刪除或隱藏冗長的文字敘述，只需要用簡短的文字來描述。以下範例為高速公路實況資訊，可看出只以簡短的文字內容來描述此影片。<br>2. 檢查影像與描述文字是否正確。 |

---

##### [範例說明15](https://accessibility.moda.gov.tw/Download/Detail/1541?Category=64) (另開新視窗)

**1.1.1 HM1110108E 提供物件的文字替代內容與非文字替代內容**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110108E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H35 |
| 類別 | HTML |
| 訊息 | 提供物件的文字替代內容與非文字替代內容，且要能完整表達該物件的意義與功能 |
| 英文訊息 | H35: Providing text alternatives on applet elements<br>H46: Using noembed with embed<br>H53: Using the body of the object element |
| 規則說明 | 任何使用Object標籤的網頁，都應該都必須要遵守此指引。 |
| 檢測說明 | 1. 檢查網頁原始碼，找出使用Object標籤的地方。(這是一個使用Object的網頁，Object標籤裡執行了一個Java Applet的程式)。在網頁上按右鍵，選擇"檢視原始檔"。如果是使用Google Chrome，則選擇"檢視網頁原始碼"。<br>2. 檢查是否在Object標籤的原始碼程式裡，填寫描述Object的替代文字，且符合Object的內容。在<Object> </Object>之間，有替代文字。<br>3. 或是利用其他方式(例如巢狀Object結構)，顯示替代圖片。 |

---
- [範例說明16](https://accessibility.moda.gov.tw/Download/Detail/1542?Category=64) (另開新視窗)

**1.1.1 GN1110109E 針對虛擬實境、立體成像、或環場空間等知覺體驗的非文字內容需要有替代文字或長描述，並至少要為這些非文字內容提供描述性的識別資訊**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1110109E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G82 |
| 類別 | General |
| 訊息 | 針對虛擬實境、立體成像、或環場空間等知覺體驗的非文字內容需要有替代文字或長描述，並至少要為這些非文字內容提供描述性的識別資訊 |
| 英文訊息 | G82: Providing a text alternative that identifies the purpose of the non-text content<br>G92: Providing long description for non-text content that serves the same purpose and presents the same information<br>G94: Providing short text alternative for non-text content that serves the same purpose and presents the same information as the non-text content<br>G95: Providing short text alternatives that provide a brief description of the non-text content<br>G96: Providing textual identification of items that otherwise rely only on sensory information to be understood<br>G100: Providing a short text alternative which is the accepted name or a descriptive name of the non-text content |
| 規則說明 | 任何使用虛擬實境、立體成像、或環場空間的網頁都必須要符合此指引。 |
| 檢測說明 | 1. 範例故宮博物館的【非看不可互動桌】就是立體影像。<br>   <br>   ![非看不可互動桌立體影像示意圖](https://accessibility.moda.gov.tw/ImagesUploads/a071ecdb-a221-491e-9449-9e679e362db9.jpg)<br>2. Second Life網頁中的虛擬實境。<br>   <br>   ![第2人生的虛擬實境示意圖](https://accessibility.moda.gov.tw/ImagesUploads/cba06ddd-2a80-457c-b1cb-a8a8b2094a42.jpg) |
| 說明 | 無 |

---

- [範例說明17](https://accessibility.moda.gov.tw/Download/Detail/1543?Category=64) (另開新視窗)

**1.1.1 GN1110110E 任何CAPTCHA驗證均需提供描述CAPTCHA驗證目的的替代文字**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1110110E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G143 |
| 類別 | General |
| 訊息 | 任何CAPTCHA驗證均需提供描述CAPTCHA驗證目的的替代文字 |
| 英文訊息 | G143: Providing a text alternative that describes the purpose of the CAPTCHA |
| 規則說明 | 任何使用CAPTCHA驗證的網頁都必須要符合此指引。 |
| 檢測說明 | 1. 在需要輸入驗證碼的網頁，於"驗證碼"的欄位以滑鼠右鍵開啟「檢查元素」<br>   <br>   ![檢視驗證碼的原始碼](https://accessibility.moda.gov.tw/ImagesUploads/a5f2043f-3d60-47af-bced-796d40010ed9.jpg)<br>2. 在「檢測元素」中確認驗證碼的圖形文字為「驗證碼」，並有提供語音播放的替代方式<br>   <br>   ![驗證碼的原始碼](https://accessibility.moda.gov.tw/ImagesUploads/8d3db137-0106-42e3-8b2b-cd6d80937ffa.jpg) |
| 說明 | 無 |

---

- [範例說明18](https://accessibility.moda.gov.tw/Download/Detail/1544?Category=64) (另開新視窗)

**1.1.1 GN1110111E 網頁上任何一個CAPTCHA驗證均至少有另一個運用不同形式的CAPTCHA驗證，且具有相同的目的與功能**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1110111E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G144 |
| 類別 | General |
| 訊息 | 網頁上任何一個CAPTCHA驗證均至少有另一個運用不同形式的CAPTCHA驗證，且具有相同的目的與功能 |
| 英文訊息 | G144: Ensuring that the Web Page contains another CAPTCHA serving the same purpose using a different modality |
| 規則說明 | 任何關於在一個CAPTCHA驗證均至少有另一個運用不同形式的CAPTCHA驗證的網頁，皆須遵守此指引。 |
| 檢測說明 | 1. 開啟檔案，以高鐵訂票系統為例，有圖形式CAPTCHA和音頻式CAPTCHA。<br>   <br>   ![驗證碼的圖形及語音播放](https://accessibility.moda.gov.tw/ImagesUploads/99a07ffc-56fd-4b02-a085-bf502d90c214.jpg)<br>2. 可以透過「圖形」或「聲音」方式得知並正確輸入驗證碼，即可通過驗證。<br>   <br>   ![輸入正確的驗證碼](https://accessibility.moda.gov.tw/ImagesUploads/d25c7e6b-fdfd-4d0b-b0bc-ef90f50a8bdf.jpg) |
| 說明 | 無 |

---

- [範例說明19](https://accessibility.moda.gov.tw/Download/Detail/1545?Category=64) (另開新視窗)

**1.1.1 HM1110112E 對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1110112E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H67 |
| 類別 | HTML |
| 訊息 | 對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性 |
| 英文訊息 | H67: Using null alt text and no title attribute on img elements for images that AT should ignore |
| 規則說明 | 任何網頁關於輔助科技想要忽略的圖片，即需使用空字串作為替代文字，並且不可使用標題屬性，皆須遵守此指引。 |
| 檢測說明 | 1. 開啟瀏覽器如Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/b1bba248-1d1e-4bab-adab-d427d2ac8f9b.jpg)<br>2. 點選選單列中的Accessibility→Text Equivalents→Show Text Equivalents 來顯示此圖片的替代文字，而此處使用空字串當它的替代文字，所以會顯示為空白。<br>   <br>   ![替代文字內容](https://accessibility.moda.gov.tw/ImagesUploads/a92c9934-71af-4e23-8885-f8d71e4f4577.jpg)<br>3. 檢視原始碼，alt屬性為使用替代文字部分，此處為空字串，且指引規定不可使用標題(title)屬性，故此處沒有使用title。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/4709c209-1ceb-4de4-b594-2103bebe02ce.jpg) |
| 說明 | 無 |

---

- [範例說明20](https://accessibility.moda.gov.tw/Download/Detail/1546?Category=64) (另開新視窗)

**1.1.1 CS1110113E 裝飾性圖片均透過CSS來置入**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS1110113E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | C9 |
| 類別 | CSS |
| 訊息 | 裝飾性圖片均透過CSS來置入 |
| 英文訊息 | C9: Using CSS to include decorative images |
| 規則說明 | 1. 任何在HTML或XHTML的網頁內，任何裝飾性的圖片或是背景圖片都必須透過CSS來置入。<br>2. 軟體檢測無法判斷圖片用途。 |
| 檢測說明 | 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/8558d821-cdd6-4902-b7b3-7ed7600e05f4.jpg)<br>2. 檢查裝飾性圖片是否有用css方式置入。<br>   <br>   ![檢視圖片置入方式](https://accessibility.moda.gov.tw/ImagesUploads/5e02dcbc-1c44-4dd3-a0e2-5b63d33a66e7.jpg) |
| 說明 | 無 |

---

##### [範例說明21](https://accessibility.moda.gov.tw/Download/Detail/1547?Category=64) (另開新視窗)

**1.1.1 CS1110114E 使用CSS方塊模型來處理版面設計，不要用佔位圖片**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS1110114E |
| 對應成功準則 | 1.1.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | C18 |
| 類別 | CSS |
| 訊息 | 使用CSS方塊模型來處理版面設計，不要用佔位圖片 |
| 英文訊息 | C18: Using CSS margin and padding rules instead of spacer images for layout design |
| 規則說明 | 任何在HTML或XHTML的網頁必須使用CSS方塊模型來設計版面，不要用佔位圖片來控制物件的間距。 |
| 檢測說明 | 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/2e4e9ab7-e0cf-484b-bbef-3fedc9b99b72.jpg)<br>2. 檢查項目內容是否有用CSS方塊模型來處理版面<br>   <br>   ![檢查項目內容](https://accessibility.moda.gov.tw/ImagesUploads/9f034d41-192f-430d-aa49-3a214ffbf046.jpg) |
| 說明 | 無 |

---

## 指引1.2：時序媒體

**針對時序媒體提供替代內容**

### 說明

本指引的目的是要提供取用時序媒體及同步媒體的能力。這項指引所囊括的媒體包括：

- 純音訊
- 純視訊
- 視訊及音訊
- 結合互動的視訊和音訊

此處所謂「結合互動的視訊和音訊」包含伴隨互動的音訊，以及帶有互動的純視訊，例如隨著使用者操控而產生劇情分歧的互動式影片。這些媒體仰賴在特定的時間點發生互動事件，例如播放到某個關鍵劇情處時，使用者是否按下按鍵會導致不同的事件發展；對於這種媒體，僅提供文字轉譯稿無法重現時序性的互動機制，所以必須要提供同步的字幕，讓使用者能在特定的字幕內容出現時做出相對的操作，藉此參與媒體內容的時序互動。

有時候，音訊描述無法塞進台詞間的既有停頓處。等級A的選項是不要提供同步媒體的音訊描述，而改提供替代的時序媒體，讓使用者能取用同步媒體中所有的資訊。這樣的選項也讓音訊描述因某些緣故無法提供的時候，能夠以非視覺的格式讓使用者取用所有的視覺資訊。對於包含互動的同步媒體來說，互動元件(例如鏈結)也可以嵌入時序媒體的替代內容之中。

本指引亦包含同步媒體的手語翻譯及延伸音訊描述的方法。在延伸音訊描述當中，視訊會凍結一段時間，讓比台詞間既有停頓處更長的音訊描述能放進去。

### 成功準則1.2.1：純音訊與純視訊(預錄) (檢測等級A)

除非音訊及視訊是文字內容的替代媒體，並且有明確地標示出來，否則就應該做到下列事項：
1. 預先錄製的純音訊：為純音訊內容提供能表達等義資訊的替代內容。
2. 預先錄製的純視訊：為純視訊內容提供表達等義資訊的替代內容或替代音軌。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1548?Category=64) (另開新視窗)

**1.2.1 GN1120100E 提供預先錄製之純音訊內容的等義資訊替代內容**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120100E |
| 對應成功準則 | 1.2.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G158 |
| 類別 | General |
| 訊息 | 提供預先錄製之純音訊內容的等義資訊替代內容 |
| 英文訊息 | G158: Providing an alternative for time-based media for audio-only content |
| 規則說明 | 所有關於時序媒體替代內容(此針對純音訊)的網頁，皆須遵守此指引。 |
| 檢測說明 | 1. 打開檔案，此處設為純音訊內容(此以"洗手教學為範例")，下方有音訊的內容敘述。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/9c9ea1b7-7140-40f2-b26b-8d5225610436.jpg)<br>2. 點選紫色文字部分，即可播放音訊檔(內容為洗手步驟)，此處設為純音訊內容。<br>   <br>   ![點選連結音訊](https://accessibility.moda.gov.tw/ImagesUploads/3238c177-3484-45f3-923d-db236a6833ba.jpg)<br>3. 檢視原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/8d57f492-b06c-49d1-88ff-e7f055ad397d.jpg) |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1549?Category=64) (另開新視窗)

**1.2.1 GN1120101E 提供預先錄製之純視訊內容的等義資訊替代內容**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120101E |
| 對應成功準則 | 1.2.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G159 |
| 類別 | General |
| 訊息 | 提供預先錄製之純視訊內容的等義資訊替代 |
| 英文訊息 | G159: Providing an alternative for time-based media for video-only content |
| 規則說明 | 所有關於時序媒體替代內容(此針對純視訊內容)的網頁，皆須遵守此指引。 |
| 檢測說明 | 1. 打開檔案，此處設為純視訊內容的影片(此以"洗手教學為範例")，下方有影片內容敘述。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/902650e3-1a5e-402b-af69-572f0031d4e1.jpg)<br>2. 檢視原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/d49fb604-58ce-4cac-975c-e7ab884480ab.jpg) |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1550?Category=64) (另開新視窗)

**1.2.1 GN1120102E 提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120102E |
| 對應成功準則 | 1.2.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G166 |
| 類別 | General |
| 訊息 | 提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容 |
| 英文訊息 | G166: Providing audio that describes the important video content and describing it as such |
| 規則說明 | 所有包括有提供描述預先錄製之重要視訊內容的音訊，並且有描述其本身係用於描述重要視訊內容等相關網頁，皆須遵守此指引。 |
| 檢測說明 | 1. 開啟網頁，此以連結到飛船降落火星的新聞視頻為例，連接到視頻的初始畫面是一個飛船的圖片，而視頻下方有一個關於影片內容的音訊檔案。<br>   <br>   ![點選圖片](https://accessibility.moda.gov.tw/ImagesUploads/9b7df5a7-d013-47d1-81ce-002e2fe4d556.jpg)<br>2. 當點選左圖紅色箭頭的飛船圖片可連接到右圖的飛船降落火星的新聞視頻。<br>   <br>   ![開啟網頁](https://accessibility.moda.gov.tw/ImagesUploads/04db28a5-d5b1-4209-bc0c-56a10d903464.jpg)<br>3. 而點選紫色字幕的音訊連結可執行一個關於影片內容的音訊檔案。<br>   <br>   ![點選連結開啟音訊](https://accessibility.moda.gov.tw/ImagesUploads/2e1519c1-c3ab-4014-97c1-4f17c3f41813.jpg)<br>4. 檢視原始碼，紅色框分別為視訊檔案和音訊檔案。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/a358f32b-dfb6-4fdf-9110-760e7f6ce8ee.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.2：字幕(預錄) (檢測等級A)

除非在同步媒體中，預先錄製的音訊內容是文字內容的替代媒體，並且有明確地標示出來，否則就應該為所有的音訊內容提供字幕。

#### 相關範例說明連結

##### [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1551?Category=64) (另開新視窗)

**1.2.2 GN1120200E 提供預先錄製之音訊內容的隱藏式或非隱藏式(永遠看得到的)字幕**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120200E |
| 對應成功準則 | 1.2.2 |
| 對應認證等級 | A |
| 對應國際技術碼 | G87 |
| 類別 | General |
| 訊息 | 提供預先錄製之音訊內容的隱藏式或非隱藏式(永遠看得到的)字幕 |
| 英文訊息 | G87: Providing closed captions<br>G93: Providing open (always visible) captions<br>H95: Using the track element to provide captions |
| 規則說明 | 1. 任何在HTML或XHTML的網頁內，如果有提供預錄製的音訊內容，都需要遵守此指引。<br>2. 檢測是否有非隱藏字幕。 |
| 檢測說明 | 1. 檢查播放音訊時是否有隱藏式字幕，並且與內容相符合。<br>   <br>   ![檢查字幕內容](https://accessibility.moda.gov.tw/ImagesUploads/485464c7-75a7-49a4-8cdb-991d6f8e57f0.jpg)<br>2. 或是播放音訊時有非隱藏字幕，並且與內容相符合。<br>   <br>   ![檢查是否有非影藏字幕](https://accessibility.moda.gov.tw/ImagesUploads/a21da484-c5fa-4d34-a773-aae2df77fd50.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.3：音訊描述或替代媒體 (檢測等級A)

除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就應該為這些同步媒體提供替代時序媒體，或預先錄製的視訊內容的音訊描述。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1552?Category=64) (另開新視窗)

**1.2.3 GN1120300E 提供預先錄製之時序媒體的替代內容，並在時序媒體的非文字內容後馬上放置連往替代內容的鏈結**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120300E |
| 對應成功準則 | 1.2.3 |
| 對應認證等級 | A |
| 對應國際技術碼 | G58 |
| 類別 | General |
| 訊息 | 提供預先錄製之時序媒體的替代內容，並在時序媒體的非文字內容後馬上放置連往替代內容的鏈結 |
| 英文訊息 | G58: Placing a link to the alternative for time-based media immediately next to the non-text content<br>G69: Providing an alternative for time based media |
| 規則說明 | 任何運用HTML或XHTML時序媒體及同步媒體的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/9a5ce1b6-0f1b-4ffa-99ce-2300afe42540.jpg)<br>2. 檢查是否有提供在非文字內容後馬上放置連往替代內容的鏈結，並點擊連結來驗證。<br>   <br>   ![點擊連結驗證](https://accessibility.moda.gov.tw/ImagesUploads/e1340c3a-4f4f-43b5-b0d3-90f9e0584e32.jpg) |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1553?Category=64) (另開新視窗)

**1.2.3 GN1120301E 除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含有音訊描述的第二音軌**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120301E |
| 對應成功準則 | 1.2.3 |
| 對應認證等級 | A |
| 對應國際技術碼 | G8 |
| 類別 | General |
| 訊息 | 除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含有音訊描述的第二音軌 |
| 英文訊息 | G8: Providing a movie with extended audio descriptions<br>G78: Providing a second, user-selectable, audio track that includes audio descriptions<br>G173: Providing a version of a movie with audio descriptions<br>H96: Using the track element to provide audio descriptions |
| 規則說明 | 任何運用HTML或XHTML時序媒體及同步媒體的網頁，都必須要遵守此指引。 |
| 檢測說明 | 範例1：含有第二音軌的視頻<br>1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/7bb7eec7-2ca7-4816-92e6-2f50b51e93c3.jpg)<br>2. 檢查是否有提供具有音訊描述或額外音訊描述的電影，或提供使用者可選取、且含有音訊描述的第二音軌，並點擊連結來驗證。<br>   <br>   ![點擊連結驗證](https://accessibility.moda.gov.tw/ImagesUploads/42f2dc86-e604-40a4-bfca-396703b5781f.jpg)<br>範例2：英語視頻的video標籤，音頻描述提供WebVTT格式<br>原始碼 (HTML5)<br><video poster="myvideo.png" controls><br>        <source src="myvideo.mp4" srclang="en" type="video/mp4"><br>        <track src="myvideo\_en.vtt" kind="descriptions" srclang="en" label="English"><br></video><br>範例3：視頻video標籤有英語和法語，音頻描述提供英文，並以WebVTT插入VTT文件的格式插入法文說明軌道<br>原始碼 (HTML5)<br><video poster="myvideo.png" controls><br>        <source src="myvideo.mp4" srclang="en" type="video/mp4"><br>        <source src="myvideo.webm" srclang="fr" type="video/webm"><br>        <track src="myvideo\_en.vtt" kind="descriptions" srclang="en" label="English"><br>        <track src="myvideo\_fr.vtt" kind="descriptions" srclang="fr" label="French"><br></video> |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1554?Category=64) (另開新視窗)

**1.2.3 GN1120302E 影片畫面僅呈現講者頭部視訊時，提供靜態文字替代**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1120302E |
| 對應成功準則 | 1.2.3 |
| 對應認證等級 | A |
| 對應國際技術碼 | G203 |
| 類別 | General |
| 訊息 | 影片畫面僅呈現講者頭部視訊時，提供靜態文字替代 |
| 英文訊息 | G203: Using a static text alternative to describe a talking head video |
| 規則說明 | 需要提供影片的靜態替代文字(例如演講者資訊、演講內容摘要以及演講標題等等) |
| 檢測說明 | 若有影片外的描述(例如演講者資訊、演講內容以及演講標題等等)，則通過檢測。<br>1. 演講的內容<br>   <br>   ![一位女性在演講的示意圖](https://accessibility.moda.gov.tw/ImagesUploads/42d035ee-ab6b-483d-8f97-1ef424dc1f1b.jpg)<br>2. 演講的標題<br>   <br>   ![在影片下方出現演講的標題示意圖](https://accessibility.moda.gov.tw/ImagesUploads/74c45ee8-9f81-437f-8c9f-7d857929b5f7.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.4：字幕(現場直播) (檢測等級AA)

為同步媒體中所有的現場直播音訊內容提供字幕。

#### 相關範例說明連結

##### [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1555?Category=64) (另開新視窗)

**1.2.4 GN2120400E 為現場的同步媒體建立字幕**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2120400E |
| 對應成功準則 | 1.2.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G9 |
| 類別 | General |
| 訊息 | 為現場的同步媒體建立字幕 |
| 英文訊息 | G9: Creating captions for live synchronized media |
| 規則說明 | 網頁中如果有嵌入即時live多媒體，需要有字幕輔助。 |
| 檢測說明 | 影片中下方有字幕輔助。<br>![影片字幕提示](https://accessibility.moda.gov.tw/ImagesUploads/3f995add-80bc-4d37-bf19-c38411abfc3b.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.5：音訊描述(預錄) (檢測等級AA)

為同步媒體中所有預先錄製的視訊內容提供音訊描述。

#### 相關範例說明連結

##### [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1556?Category=64) (另開新視窗)

**1.2.5 GN2120500E 為同步媒體中所有的視訊內容提供具有音訊描述或延伸音訊描述，或提供使用者可選取、且含有音訊描述的第二音軌**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2120500E |
| 對應成功準則 | 1.2.5 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G68 |
| 類別 | General |
| 訊息 | 為同步媒體中所有的視訊內容提供具有音訊描述或延伸音訊描述，或提供使用者可選取、且含有音訊描述的第二音軌 |
| 英文訊息 | G8: Providing a movie with extended audio descriptions<br>G78: Providing a second, user-selectable, audio track that includes audio descriptions<br>G173: Providing a version of a movie with audio descriptions<br>H96: Using the track element to provide audio descriptions |
| 規則說明 | 任何運用HTML或XHTML時序媒體及同步媒體的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/68c9d422-6ea9-4da1-babe-d84e5493f0d2.jpg)<br>2. 檢查是否有提供具有音訊描述或額外音訊描述的電影，或提供使用者可選取、且含有音訊描述的第二音軌，並點擊連結來驗證。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/7d1ba83c-03ac-4f3c-af58-025fb69006a3.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.6：手語(預錄) (檢測等級AAA)

為同步媒體中所有預先錄製的音訊內容提供手語翻譯。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1557?Category=64) (另開新視窗)

**1.2.6 GN3120600E 在視訊串流當中包含手語翻譯**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120600E |
| 對應成功準則 | 1.2.6 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G54 |
| 類別 | General |
| 訊息 | 在視訊串流當中包含手語翻譯 |
| 英文訊息 | G54: Including a sign language interpreter in the video stream |
| 規則說明 | 任何使用HTML或XHTML時序媒體及同步媒體網頁中的影片都必要採取此指引。 |
| 檢測說明 | 1. 使用網頁瀏覽器打開，網址 https://www.youtube.com/watch?v=dAchb95IC1E 中的影片可看到視訊串流中包含手語翻譯。<br>   <br>   ![手語翻譯畫面](https://accessibility.moda.gov.tw/ImagesUploads/88ac7f82-b2f9-4c58-9d8b-99684fb92532.jpg)<br>2. 檢查是否有提供手語翻譯的視訊串流，若有即通過驗證。 |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1558?Category=64) (另開新視窗)

**1.2.6 GN3120601E 提供可以在不同視埠播放、或由播放軟體疊合在影像上的手語翻譯同步視訊**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120601E |
| 對應成功準則 | 1.2.6 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G81 |
| 類別 | General |
| 訊息 | 提供可以在不同視埠播放、或由播放軟體疊合在影像上的手語翻譯同步視訊 |
| 英文訊息 | G81: Providing a synchronized video of the sign language interpreter that can be displayed in a different viewport or overlaid on the image by the player |
| 規則說明 | 使用HTML或XHTML時序媒體及同步媒體網頁中的影片都必要採取此指引 |
| 檢測說明 | 1. 使用網頁瀏覽器打開，網址 https://www.youtube.com/watch?v=dAchb95IC1E 中的影片，可看到視訊串流中包含額外疊合於播放視訊中的手語翻譯視訊。<br>   <br>   ![手語視訊畫面](https://accessibility.moda.gov.tw/ImagesUploads/7ec6ffc8-e17f-469e-96d3-21d9c6d67798.jpg)<br>2. 檢查是否提供疊合於影像上的手語翻譯於視訊中來通過驗證。 |
| 說明 | 無 |

---

### 成功準則1.2.7：延伸音訊描述 (檢測等級AAA)

當前景音訊停頓處不足以讓音訊描述轉達視訊意義，則為所有同步媒體中預先錄製的視訊內容提供延伸音訊描述。

#### 相關範例說明連結

##### [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1559?Category=64) (另開新視窗)

**1.2.7 GN3120700E 當前景音訊停頓處不足插入音訊描述時，為影片提供延伸音訊描述**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120700E |
| 對應成功準則 | 1.2.7 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G8 |
| 類別 | General |
| 訊息 | 當前景音訊停頓處不足插入音訊描述時，為影片提供延伸音訊描述 |
| 英文訊息 | G8: Providing a movie with extended audio descriptions<br>H96: Using the track element to provide audio descriptions |
| 規則說明 | 使用HTML或XHTML時序媒體及同步媒體網頁中的影片都必要採取此指引 |
| 檢測說明 | 1. 使用QuickTime播放器開啟具有額外音訊的描述電影<br>   <br>   ![開啟影片](https://accessibility.moda.gov.tw/ImagesUploads/54c02848-180a-4ec6-8797-0638e297e026.jpg)<br>2. 檢測音訊描述的原始碼<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/5c23d8b7-449c-409c-8db3-272e3d74cb24.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.8：替代媒體(預錄) (檢測等級AAA)

為所有預先錄製的同步媒體及所有預先錄製的純視訊媒體，提供時序媒體替代內容。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1560?Category=64) (另開新視窗)

**1.2.8 GN3120800E 提供所有時序媒體的替代內容，並在時序媒體的非文字內容後馬上放置連往替代內容的鏈結**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120800E |
| 對應成功準則 | 1.2.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G58 |
| 類別 | General |
| 訊息 | 提供所有時序媒體的替代內容，並在時序媒體的非文字內容後馬上放置連往替代內容的鏈結 |
| 英文訊息 | G58: Placing a link to the alternative for time-based media immediately next to the non-text content<br>G69: Providing an alternative for time based media |
| 規則說明 | 任何運用HTML或XHTML時序媒體及同步媒體的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/14085c8f-3a74-40f2-b8ac-2cca79aef2fe.jpg)<br>2. 檢查是否有提供在非文字內容後馬上放置連往替代內容的鏈結，並點擊連結來驗證。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/cd1e9452-74e2-4066-b0f7-926c582876e9.jpg) |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1561?Category=64) (另開新視窗)

**1.2.8 GN3120801E 提供所有純視訊內容的時序媒體替代內容**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120801E |
| 對應成功準則 | 1.2.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G159 |
| 類別 | General |
| 訊息 | 提供所有純視訊內容的時序媒體替代內容 |
| 英文訊息 | G159: Providing an alternative for time-based media for video-only content |
| 規則說明 | 所有網頁中提供的純視訊內容都必須遵守此規則。 |
| 檢測說明 | 1. 檢查網頁中是否存在純視訊內容的元件。<br>2. 並確認是否存在影片的替代內容。<br>3. 確認影片和替代內容是否相符合。<br>![檢視影片](https://accessibility.moda.gov.tw/ImagesUploads/4fee3793-f5b1-461e-9236-70017e41a44e.jpg) |
| 說明 | 無 |

---

### 成功準則1.2.9：純音訊(現場直播) (檢測等級AAA)

為現場直播純音訊內容提供能表達等義資訊的替代內容。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1562?Category=64) (另開新視窗)

**1.2.9 GN3120900E 提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120900E |
| 對應成功準則 | 1.2.9 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G150 |
| 類別 | General |
| 訊息 | 提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務。 |
| 英文訊息 | G150: Providing text based alternatives for live audio-only content<br>G157: Incorporating a live audio captioning service into a Web page |
| 規則說明 | 使用HTML或XHTML時序媒體及同步媒體網頁中的影片都必要採取此指引。 |
| 檢測說明 | 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/f0d1cd9f-e3b2-4639-8fe9-689c2819e8d4.jpg)<br>2. 檢查是否提供純音訊檔文字形式的替代內容或現場音訊字幕服務。<br>3. 並在網頁中檢視文字字幕內容是否與音訊檔吻合。 |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1563?Category=64) (另開新視窗)

**1.2.9 GN3120901E 提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3120901E |
| 對應成功準則 | 1.2.9 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G151 |
| 類別 | General |
| 訊息 | 提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結 |
| 英文訊息 | G151: Providing a link to a text transcript of a prepared statement or script if the script is followed |
| 規則說明 | 當演講開始時，演講內容也會公布在網路上。 |
| 檢測說明 | 1. 網路影片總統正在演講<br>   <br>   ![總統演講畫面](https://accessibility.moda.gov.tw/ImagesUploads/ddfa79a8-a56d-4808-bad6-9678cd590fd3.jpg)<br>2. 演講內容同時被公布在網路上，並且有頁數連往下一頁講稿<br>   <br>   ![演講稿圖片](https://accessibility.moda.gov.tw/ImagesUploads/f3690224-2cbd-4bf9-9801-911cafbcec17.jpg) |
| 說明 | 無 |

---

## 指引1.3：可調適

**建立能以不同方式呈現(例如簡化的版面)，而不會喪失資訊或結構的內容**

### 說明

本指引的目的在確保所有的資訊都有所有使用者可感知的形式，像是報讀出來或以較簡單的視覺布局呈現。如果所有的資訊都有軟體可判別的形式，就可以用不同的方式如視覺性、聽覺性、觸覺性等方式呈現給使用者。如果資訊嵌入在特定的呈現方式中，而其結構與資訊無法由輔助科技以程式化的方式來判讀，那麼就無法以使用者所需的其他形式來呈現。

本指引下的所有成功準則都是要確保可使用在呈現中常見編碼的不同資訊類型，而能以不同的型態來表達。

### 成功準則1.3.1：資訊與關連性 (檢測等級A)

由呈現方式所傳達的資訊、結構與關連性要能以程式化的方式判讀，或者有對應的文字。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1506?Category=63) (另開新視窗)

**1.3.1 HM1130100C 網頁中的標頭組件必須要按照正確的巢狀層次結構來配置**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1130100C |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H42 |
| 類別 | HTML |
| 訊息 | 網頁中的標頭組件必須要按照正確的巢狀層次結構來配置 |
| 英文訊息 | H42: Using h1-h6 to identify headings |
| 規則說明 | 如果每段落群存在一主題敘述，通過檢測，否則檢測失敗。 |
| 範例 | <h1>水果與植物</h1><br>     <p>人類吃的植物數量豐富</p><br>     <p>第二段落</p><br>     <p>第三段落</p><br>     <h2>水果</h2><br>         <p>一個水果是植物的一種構造，是它的種子...</p><br>         <h3>蘋果</h3><br>             <p>蘋果是波馬白堊紀蘋果樹的種子...</p><br>         <h3>橘子</h3><br>             <p>橘子是一種古代栽培混合型的起源...</p> |
| 說明 | <h1>...<h3>為標題標籤(主題敘述)，<p>為文字段落標籤。 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1507?Category=63) (另開新視窗)

**1.3.1 HM1130101C 使用範疇(scope)屬性，來建立表格行列標題儲存格與資料儲存格之間的關連**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1130101C |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H63 |
| 類別 | HTML |
| 訊息 | 使用範疇(scope)屬性，來建立表格行列標題儲存格與資料儲存格之間的關連 |
| 英文訊息 | H63: Using the scope attribute to associate header cells and data cells in data tables |
| 規則說明 | 如果表格標籤存在，且其內有超過一組以上內含<th>標籤的<tr>標籤組，則<th>標籤需使用scope屬性或使用id屬性與其他<th>標籤或<td>標籤中的headers屬性建立關聯，通過檢測，否則檢測失敗。 |
| 範例 | <table><br>     <tr><br>         <td></td><br>         <th scope="col">星期一</th><br>         <th scope="col">星期二</th><br>         <th scope="col">星期三</th><br>         <th scope="col">星期四</th><br>         <th scope="col">星期五</th><br>     </tr><br>     <tr><br>         <th scope="row">上午</th><br>         <td>休館</td><br>         <td>開放</td><br>         <td>開放</td><br>         <td>開放</td><br>         <td>開放</td><br>     </tr><br>     <tr><br>         <th scope="row">下午</th><br>         <td>休館</td><br>         <td>開放</td><br>         <td>開放</td><br>         <td>開放</td><br>         <td>休館</td><br>     </tr><br></table> |
| 說明 | 在標題列中，scope範圍屬性的col值將每個標題格與該行中的資料格相關聯。在標題行中，scope範圍屬性的row值將各個標題與其列相關聯。沒有範圍屬性，螢幕報讀軟體使用者將不容易理解行列標題和資料格之間的關係。 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1508?Category=63) (另開新視窗)

**1.3.1 HM1130101C 使用對應識別碼(id)與標頭(headers)屬性，來建立表格行列標題儲存格與資料儲存格之間的關連**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1130101C |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H43 |
| 類別 | HTML |
| 訊息 | 使用對應識別碼(id)與標頭(headers)屬性，來建立表格行列標題儲存格與資料儲存格之間的關連 |
| 英文訊息 | H43: Using id and headers attributes to associate data cells with header cells in data tables |
| 規則說明 | 如果表格標籤存在，且其內有超過一組以上內含<th>標籤的<tr>標籤組，則<th>標籤需使用scope屬性或使用id屬性與其他<th>標籤或<td>標籤中的headers屬性建立關聯，通過檢測，否則檢測失敗。 |
| 範例 | <table><br>     <tr><br>         <th rowspan="2" id="h">作業</th><br>         <th colspan="3" id="e">考試</th><br>     </tr><br>     <tr><br>         <th id="e1" headers="e">1</th><br>         <th id="e2" headers="e">2</th><br>         <th id="ef" headers="e">期末</th><br>     </tr><br>     <tr><br>         <td headers="h">15%</td><br>         <td headers="e e1">15%</td><br>         <td headers="e e2">15%</td><br>         <td headers="e ef">20%</td><br>     </tr><br></table> |
| 說明 | 第一組<tr>標籤中，<th>標題儲存格裡rowspan屬性為設定一個儲存格橫跨的欄的數目，colspan屬性為設定一個儲存格縱跨的列的數目，並以id屬性予以辨識。第二組<tr>標籤中，<th>標題儲存格與數據儲存格分別以headers屬性指向所屬的標題儲存格的id值，將表格中的標題儲存格和一個數據儲存格關聯起來。 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1509?Category=63) (另開新視窗)

**1.3.1 HM1130102C 表單控制元件組件需以欄位組＜fieldset＞組件來分群，並以說明＜legend＞組件來提供標題**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1130102C |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H71 |
| 類別 | HTML |
| 訊息 | 表單控制元件組件需以欄位組<fieldset>組件來分群，並以說明<legend>組件來提供標題 |
| 英文訊息 | H71: Providing a description for groups of form controls using fieldset and legend elements |
| 規則說明 | 如果表單中存在群組控制元件的<fieldset>與<legend>標籤，且內容或屬性值不為空值，通過檢測，否則檢測失敗。 |
| 範例 | <fieldset><br>     <legend>以下誰為Hamlet劇本的撰寫者：</legend><br>         <input type="radio" id="shakespeare" name="hamlet" checked="checked" value="a"><label for="shakespeare">莎士比亞</label><br>         <input type="radio" id="kipling" name="hamlet" value="b"><label for="kipling">吉卜林</label><br></fieldset> |
| 說明 | 單選項目使用<fieldset>標籤將其以群組表示，並使用<legend>標籤提供該群組的說明。 群組內每個<input>標籤中type屬性為顯示輸入的類型、checked屬性顯示已選擇或不選擇、name屬性為該標籤的識別名稱、value屬性為顯示變數值。 <label>標籤中for屬性為規定label與哪個表單元件綁定(與表單元件中的id相符)。 |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1510?Category=63) (另開新視窗)

**1.3.1 HM1130102C 表單選擇＜select＞組件則需以選項分群＜optgroup＞組件來將選項＜option＞組件加以分群**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1130102C |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H85 |
| 類別 | HTML |
| 訊息 | 表單選擇<select>組件則需以選項分群<optgroup>組件來將選項<option>組件加以分群 |
| 英文訊息 | H85: Using OPTGROUP to group OPTION elements inside a SELECT |
| 規則說明 | 如果表單中<select>標籤中使用分組<optgroup>標籤，並正確將<option>選項群組化，則通過檢測，否則檢測失敗。 |
| 範例 | <select id="food" name="food"><br>     <optgroup label="水果"><br>         <option value="1">蘋果</option><br>         <option value="2">香蕉</option><br>     </optgroup><br>     <optgroup label="蔬菜"><br>         <option value="3">波菜</option><br>     </optgroup><br></select> |
| 說明 | 下拉選單<select>標籤中的name屬性為該標籤的識別名稱、value屬性為傳出的變數值或引數。 <optgroup>標籤則為將<option>標籤加以分群，並以label屬性做為該群組名稱。 |

---

##### [範例說明6](https://accessibility.moda.gov.tw/Download/Detail/1512?Category=63) (另開新視窗)

**1.3.1 HM1130104C 可見的表單控制元件均需有對應的標籤＜label＞組件，或有標題(title)屬性，且其內容或值均不得為空字串或空白**

| 項目 | 內容 |
|------|------|
| 檢測碼 | HM1130104C |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H44 |
| 類別 | HTML |
| 訊息 | 可見的表單控制元件均需有對應的標籤<label>組件，或有標題(title)屬性，且其內容或值均不得為空字串或空白 |
| 英文訊息 | H44: Using label elements to associate text labels with form controls<br>H65: Using the title attribute to identify form controls when the label element cannot be used |
| 規則說明 | 如果有一或多的表單控制元件及其id屬性存在且id屬性值不為空，並有標籤組件其內的for屬性值與表單控制元件的id屬性值相互對應，通過檢測，否則檢測失敗。 |
| 範例 | <label for="firstname">姓氏:</label><br><input type="text" name="firstnametext" id="firstname" /> |
| 說明 | <label>標籤中for屬性為規定label與哪個表單元件綁定(與標單元件中的id相符)。 <input>標籤中type屬性為顯示輸入的類型(此為文字類型)，標籤中的name屬性為該標籤的識別名稱，id屬性則為該標籤的唯一識別。 |

---

##### [範例說明7](https://accessibility.moda.gov.tw/Download/Detail/1564?Category=64) (另開新視窗)

**1.3.1 GN1130100E 使用文字來傳達藉由文字呈現上的變化所傳達的資訊**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1130100E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G117 |
| 類別 | General |
| 訊息 | 使用文字來傳達藉由文字呈現上的變化所傳達的資訊 |
| 英文訊息 | G117: Using text to convey information that is conveyed by variations in presentation of text |
| 規則說明 | 當文字需要以變化性方式呈現(例如：文字以粗體表示)時，須遵守此指引。 |
| 範例 | 1. 使用Google Chrome瀏覽器開啟檔案<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/8bb0fcf9-8abb-40ae-ae6d-9b1c398ebf47.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視網頁原始碼](https://accessibility.moda.gov.tw/ImagesUploads/006d1767-7f07-48bb-a869-13c1d55ef802.jpg)<br>3. 從程式碼中可以瞭解到以文字格式標籤來表示的文字效果，如下<strong>會將文字改成粗體(即WCAG 2.0 (新)為粗體字)，<h2>為設定的標題大小，因此標題無障礙網頁指引也會一般字體大小有所不同。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/051f2ba3-95f6-4094-88b1-23ac65ffbf6c.jpg) |
| 說明 | 無 |

---

##### [範例說明8](https://accessibility.moda.gov.tw/Download/Detail/1565?Category=64) (另開新視窗)

**1.3.1 GN1130101E 使用顏色線索的時候就使用語意標記**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1130101E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G138 |
| 類別 | General |
| 訊息 | 使用色彩線索的時候就使用語意標記 |
| 英文訊息 | G138: Using semantic markup whenever color cues are used |
| 規則說明 | 使用顏色改變文字時，須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案(網頁內改變文字顏色：以紅色字體以及字體背景色為黃色為例)<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/1b3e2c94-d9f3-4eea-a99a-720a18772a16.jpg)<br>2. 點選右鍵檢視網頁原始碼<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/da68076f-2847-4900-8f3c-8aa2a5b53508.jpg)<br>3. 使用顏色改變文字時可以用CSS樣式表顏色屬性來表示，例如：background-color為背景顏色，color可調整文字顏色。下列範例中我們得知從<span style="background-color: YELLOW"> 可將文字背景色設置成黃色，<font size="5" color="RED">可將文字設為紅色。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/4f53cba0-16af-46a8-aed4-3b0c59cfc433.jpg) |
| 說明 | 無 |

---

##### [範例說明9](https://accessibility.moda.gov.tw/Download/Detail/1566?Category=64) (另開新視窗)

**1.3.1 GN1130102E 從呈現當中抽離資訊與結構，以便啟用不同的呈現**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1130102E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G140 |
| 類別 | General |
| 訊息 | 從呈現當中抽離資訊與結構，以便啟用不同的呈現 |
| 英文訊息 | G140: Separating information and structure from presentation to enable different presentations |
| 規則說明 | 以不同資訊結構(例如：當滑鼠移過某處時，會呈現特殊效果來呈現不同訊息)來表示不同訊息的呈現，須遵守此指引。 |
| 範例 | 1. 使用Google Chrome瀏覽器開啟檔案(下列範例為:滑鼠游標指到"連結1"時會出現背景色為橘色的變化)<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/5024b022-d753-4915-bd70-6130278e02c9.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/e1f8e600-0c39-41a7-9853-ffbc1146fc0b.jpg)<br>3. 從呈現當中抽離資訊與結構，以便啟用不同的呈現MouseOver 當滑鼠移到上面時、MouseOut 當滑鼠移開時所觸動的事件，這邊是切換不同的背景色(bgColor)。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/1569c0b9-c1c7-48b6-8dfe-437ea9185fdd.jpg) |
| 說明 | 無 |

---

- [範例說明10](https://accessibility.moda.gov.tw/Download/Detail/1567?Category=64) (另開新視窗)

**1.3.1 CS1130103E 文字的視覺呈現均以CSS來控制**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS1130103E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | C22 |
| 類別 | CSS |
| 訊息 | 文字的視覺呈現均以CSS來控制 |
| 英文訊息 | C22: Using CSS to control visual presentation of text |
| 規則說明 | 需要用到CSS樣式表來改變文字呈現方式時,且皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案,確認是否有受CSS樣式表影響文字視覺呈現。(此範例顯示文字靠右及顯示背景色)<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/f1f569a4-9905-493a-9e35-088c2d8f3e93.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/3c85d437-4449-43a0-8507-689e4703b942.jpg)<br>3. 程式碼中我們可以看到以CSS樣式表控制文字視覺呈現,如下<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/2d177973-86bb-4662-a12d-4be5d9e4143c.jpg) |
| 說明 | 無 |

---

##### [範例說明11](https://accessibility.moda.gov.tw/Download/Detail/1568?Category=64) (另開新視窗)

**1.3.1 HM1130104E 適當使用巢狀標題呈現文件結構**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130104E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H42 |
| 類別 | HTML |
| 訊息 | 適當使用巢狀標頭呈現文件結構 |
| 英文訊息 | H42: Using h1-h6 to identify headings<br>ARIA12: Using role=heading to identify headings<br>ARIA20: Using the region role to identify a region of the page<br>H97: Grouping related links using the nav element |
| 規則說明 | 在HTML和XHTML任何有使用巢狀標頭時(巢狀標頭通常用來呈現網頁中的章節的層次結構,例如將每個段落標頭,如下列範例中水果、蘋果等設為不同階層的標題)讓文章看起來有段落層次的結構,皆須遵守此指引。 |
| 檢測說明 | 範例1:使用H1到H6編寫網頁內容的標題順序<br>1. 使用Google Chrome瀏覽器開啟檔案。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/d480733e-2055-4411-952b-bddc7150a680.jpg)<br>2. 按滑鼠右鍵,點選檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/69acd954-7339-4533-904b-185b090dae88.jpg)<br>3. 對照呈現的網頁受巢狀標題<h1> <h2> <h3>顯示層級結構。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/eb9c7063-577f-4ae5-8cb0-8fc22c4042f5.jpg)<br>範例2:使用role="heading" 實現簡易標題<br>網頁呈現<br>![範例二網頁呈現圖片](https://accessibility.moda.gov.tw/ImagesUploads/c30791a2-00b9-40a3-920c-b55e351a0ff6.jpg)<br>原始碼<br><div role="heading">全球新聞</div><br>... a list of global news with editorial comment....<br><div role="heading">當地新聞</div><br>... a list of local news, with editorial comment ... |
| 說明 | 無 |

---

##### [範例說明12](https://accessibility.moda.gov.tw/Download/Detail/1569?Category=64) (另開新視窗)

**1.3.1 HM1130105E 使用語意組件來標記結構**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130105E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H48 |
| 類別 | HTML |
| 訊息 | 使用語意組件來標記結構 |
| 英文訊息 | G115: Using semantic elements to mark up structure<br>H48: Using ol, ul and dl for lists or groups of links |
| 規則說明 | 在HTML和XHTML中需要用語意組件來標記結構時,皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案>。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/305af29c-a3d7-468c-8b6d-aaa2281edb09.jpg)<br>2. 按滑鼠右鍵,點選檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/942d8b81-ea33-4fd5-99c7-ce1dac404a59.jpg)<br>3. 表示購買的商品用清單表示其語意結構,<li>標籤表示清單結構。<li>標籤可用在有序列表標籤(<ol>) 和無序列表標籤(<ul>)中,若用在<ol>有順序的列表時會出現1. 2. 3… 排列,但在此是用在無順序的列表中。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/efa19b95-5e85-4a64-8b25-9ed4fcd2dc17.jpg) |
| 說明 | 無 |

---

##### [範例說明13](https://accessibility.moda.gov.tw/Download/Detail/1570?Category=64) (另開新視窗)

**1.3.1 HM1130106E 使用具語意的標記來標出強調的文字或特殊文字**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130106E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H49 |
| 類別 | HTML |
| 訊息 | 使用具語意的標記來標出強調的文字或特殊文字 |
| 英文訊息 | H49: Using semantic markup to mark emphasized or special text |
| 規則說明 | 在HTML和XHTML中,有使用具有語言意義的標記來強調的文字或特殊文字時,皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/4587ab92-8e65-4d27-b818-11183d439711.jpg)<br>2. 點選右鍵檢查標籤。![檢查元素](https://accessibility.moda.gov.tw/ImagesUploads/91d678aa-dc72-465f-9c86-f18ecedaae02.jpg)<br>3. 對照程式碼是否有因標記來突顯語意中的特殊文字,下方以<em>標籤表示斜體字,<strong>標籤表示粗體字,例如:「 _所獲得的_」為斜體字,「 **鏡子**」為粗體字。<br>   <br>   ![對照標記設定](https://accessibility.moda.gov.tw/ImagesUploads/f9351196-606b-45e3-9c93-5ebed3cf2f5f.jpg) |
| 說明 | 無 |

---

##### [範例說明14](https://accessibility.moda.gov.tw/Download/Detail/1571?Category=64) (另開新視窗)

**1.3.1 HM1130107E 使用表格標記來呈現表格資訊**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130107E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H51 |
| 類別 | HTML |
| 訊息 | 使用表格標記來呈現表格資訊 |
| 英文訊息 | H51: Using table markup to present tabular information |
| 規則說明 | 在HTML和XHTML中,需要使用表格的標記來呈現出表格內的資訊時,皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案。<br>   <br>   ![開啟網站](https://accessibility.moda.gov.tw/ImagesUploads/734c3eb6-4ebf-4f56-9298-a0548e097829.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/73be52dc-e782-4835-8264-9edf517404a0.jpg)<br>3. 對照程式碼是否以表格標記來呈現此網頁資訊(上例為無框線的表格),以下使用到<table>、<tr>、<td>、<th>等相關的表格標記。<table>表示表格的標籤,<tr>定義表格中的行,<td>為每個單元格,<th>表示表格的標頭名稱。<br>   <br>   ![檢視原始碼設計](https://accessibility.moda.gov.tw/ImagesUploads/82a06c79-423e-463f-9138-edc7790786ae.jpg) |
| 說明 | 無 |

---

##### [範例說明15](https://accessibility.moda.gov.tw/Download/Detail/1572?Category=64) (另開新視窗)

**1.3.1 HM1130108E 以有意義的標記來提供資料表格的概觀**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130108E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H73 |
| 類別 | HTML |
| 訊息 | 以有意義的標記來提供資料表格的概觀 |
| 英文訊息 | H73: Using the summary attribute of the table element to give an overview of data tables |
| 規則說明 | 有意義的標記來提供資料表格的概觀適用於HTML標準,皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/33476a69-f2b7-45cc-9c91-471854bcdbf8.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/eebf8e7a-b41b-4377-8d2e-6ae3cd047933.jpg)<br>3. 檢查原始碼是否以有意義的標記來提供資料表格的概觀(<tr>標籤(table row)表示為行,第一行為星期一到五,第一列為時間,內容對照時間及星期來呈現表格的概觀;有意義的標記如summary屬性來為提供詳細的表格說明,<td>標籤是指表格中的一個單元格可用來擺放內容,<th>標籤則用來宣告表頭的方格例如星期及時間,border屬性為邊框,可設定寬度。)<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/9258eba0-c952-43a8-add3-f74b938a54a2.jpg) |
| 說明 | 無 |

---
##### [範例說明16](https://accessibility.moda.gov.tw/Download/Detail/1573?Category=64) (另開新視窗)

**1.3.1 HM1130109E 以有意義的標記來建立表格行列標題與資料表格的關連**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130109E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H39 |
| 類別 | HTML |
| 訊息 | 以有意義的標記來建立表格標題與資料表格的關連 |
| 英文訊息 | H39: Using caption elements to associate data table captions with data tables |
| 規則說明 | 在HTML中，當需要建立表格及資料表時需要用有意義的標籤表示時，皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案。<br>   <br>   ![瀏覽檔案](https://accessibility.moda.gov.tw/ImagesUploads/f7376803-07c1-4e6e-9182-a41cd6755f86.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/db314a59-7e25-49a7-90cc-29b151731719.jpg)<br>3. 檢查原始碼是否以有意義的標籤來建立表格標題與資料表格的關連(<tr>標籤表示為行，第一行為日期，第二行為關聯到第一行的行程內容，<td>標籤為單元格用於顯示資料內容)<br>   <br>   ![檢查原始碼標題格式](https://accessibility.moda.gov.tw/ImagesUploads/2c0e300e-65b9-4e06-a222-078c97c5bf8f.jpg) |
| 說明 | 無 |

---

##### [範例說明17](https://accessibility.moda.gov.tw/Download/Detail/1574?Category=64) (另開新視窗)

**1.3.1 HM1130110E 對於複雜表格，以有意義的標記來建立表格行列標題儲存格與資料儲存格之間的關連**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130110E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H43 |
| 類別 | HTML |
| 訊息 | 對於複雜表格，以有意義的標記來建立表格標頭儲存格與資料儲存格之間的關連 |
| 英文訊息 | H43: Using id and headers attributes to associate data cells with header cells in data tables<br>H63: Using the scope attribute to associate header cells and data cells in data tables |
| 規則說明 | 在HTML中，使用有意義的標籤來建立表格標頭儲存格與資料儲存格之間的關係，皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟檔案。<br>   <br>   ![開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/65122e8b-b24d-4c20-9339-d54d879a4a0c.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![點選右鍵檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/5db7b06a-2a72-4820-b441-dac0a55fe1a6.jpg)<br>3. 可看到表格標頭儲存格與資料儲存格之間的關係，例如：表格列標頭指的是名字，電話，傳真、城市，珍妮、Clive Lloyd、戈登格里尼奇則為行標頭，其他資料是指除了表格標頭以外的資料，如412-212-5421、412-212-5400、匹茲堡等。以上範例表示表格行列標頭與資料間的關係，在<th scope=\"col\">名字</th>程式碼中scope屬性標示該標頭的範圍，其他如電話，傳真，城市為每一列的標頭都會關聯到其他資料儲存格，像是名字會對照到珍妮，電話會對照到412-212-5421以此類推。<br>   <br>   ![標題設計範例](https://accessibility.moda.gov.tw/ImagesUploads/7d18ccb8-9600-4393-9987-3fafe64d9eb1.jpg) |
| 說明 | 無 |

---

##### [範例說明18](https://accessibility.moda.gov.tw/Download/Detail/1575?Category=64) (另開新視窗)

**1.3.1 HM1130111E 將表單控制元件及表單內的選項予以適當地分群並提供相關的描述**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130111E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H71 |
| 類別 | HTML |
| 訊息 | 將表單控制元件及表單內的選項予以適當地分群並提供相關的描述 |
| 英文訊息 | H71: Providing a description for groups of form controls using fieldset and legend elements<br>H85: Using OPTGROUP to group OPTION elements inside a SELECT<br>ARIA17: Using grouping roles to identify related form controls |
| 規則說明 | 在HTML和XHTML中，若需使用表單控制元件及表單內的選項要做適當的分組時，皆須遵守此指引。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟頁面。<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢測原始碼示意圖](https://accessibility.moda.gov.tw/ImagesUploads/fba7d91f-e102-493d-a016-39d1b5a608fd.jpg)<br>3. 在原始碼中以<fieldset>標籤來設置表單中的方框來分組，此方框可當作分隔表單的區域，接下來以<legend>作為這個區域的標題，如下列範例：住址為方框的標題。<br>   <br>   ![框線示意圖](https://accessibility.moda.gov.tw/ImagesUploads/aa2d61c0-d5d8-4223-b547-872d9b76c994.jpg) |
| 說明 | 無 |

---

##### [範例說明19](https://accessibility.moda.gov.tw/Download/Detail/1576?Category=64) (另開新視窗)

**1.3.1 HM1130112E 使用標籤組件將文字標籤與表單控制元件建立關連**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130112E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H44 |
| 類別 | HTML |
| 訊息 | 使用標籤組件將文字標籤與表單控制元件建立關連 |
| 英文訊息 | H44: Using label elements to associate text labels with form controls<br>ARIA1: Using the aria-describedby property to provide a descriptive label for user interface controls |
| 規則說明 | 1. 使用標籤的方式將文字標籤與表單控制元件建立關連時，適用於HTML，皆須遵守此指引。<br>2. 使用aria-describedby屬性描述按鈕的操作。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟頁面。<br>   <br>   ![使用Google Chrome瀏覽器開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/e0d40625-82a6-477c-bd81-e4736f0ad2e5.jpg)<br>2. 點選右鍵檢視網頁原始碼。<br>   <br>   ![ 點選右鍵檢視網頁原始碼](https://accessibility.moda.gov.tw/ImagesUploads/fb0c313d-0df3-424e-a624-5e8bb294c0fe.jpg)<br>3. 在下面的例子中以核取方塊的勾選作為表單的控制元件(表單控制元件表示在表單中出現的控制元件如核取方塊或是選項按鈕等)，文字標籤為HTML，程式碼中type=\"checkbox\" id=\"markuplang\"代表id為markuplang的核取方塊"checkbox" ，以及程式碼中<label for=\"markuplang\">HTML</label>id同樣設為markuplang的 HTML文字標籤產生關聯，代表著核取方塊的勾選或不勾選來表示和文字標籤為HTML間的關聯。<br>   <br>   ![檢視原始碼核取方塊和文字標籤為HTML間的關聯](https://accessibility.moda.gov.tw/ImagesUploads/aef194eb-c5a2-45ce-bbc2-db50386d1627.jpg) |
| 說明 | 無 |

---

##### [範例說明20](https://accessibility.moda.gov.tw/Download/Detail/1577?Category=64) (另開新視窗)

**1.3.1 HM1130113E 無法使用標籤組件的情況下，用標題屬性來指明表單控制元件**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM1130113E |
| 對應成功準則 | 1.3.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | H65 |
| 類別 | HTML |
| 訊息 | 無法使用標籤組件的情況下，用標題屬性來指明表單控制元件 |
| 英文訊息 | H65: Using the title attribute to identify form controls when the label element cannot be used<br>ARIA1: Using the aria-describedby property to provide a descriptive label for user interface controls |
| 規則說明 | 1. 在HTML網頁下無法辨識value、alt等標籤內容時可以使用標題屬性來表示表單控制元件，皆須遵守此指引。<br>2. 使用aria-describedby說明與表單字段相關聯。 |
| 檢測說明 | 1. 使用Google Chrome瀏覽器開啟頁面。<br>   <br>   ![使用Chrome瀏覽器開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/dfc9e78a-8ab6-4e88-9238-ee1630515b63.jpg)<br>2. 當游標移置方框中會有文字訊息的提示(以下範例為：將游標移至第一個方框(欄位)中)。<br>   <br>   ![文字訊息提示](https://accessibility.moda.gov.tw/ImagesUploads/9546ce24-5cb9-4741-a587-6304f72bfd3a.jpg)<br>3. 點選右鍵檢視網頁原始碼。<br>   <br>   ![檢視網頁原始碼](https://accessibility.moda.gov.tw/ImagesUploads/7127d62c-3c6a-40ab-b471-76de5bc6ddd7.jpg)<br>4. 當有些視覺設計時不能容納標籤時，我們可以使用title屬性來標籤表單控制元件(表單控制元件表示在表單中出現的控制元件如文字欄位、核取方塊或是選項按鈕等)，當游標移至方框中時會出現文字訊息的提示，使我們不會困惑此欄位方框需填入什麼訊息。例如，下方title屬性設為"區域號碼＂時，游標移至此欄位時可看到區域號碼的提示訊息，代表此欄位需填入區域號碼，以此類推。<br>   <br>   ![ title屬性設定方式](https://accessibility.moda.gov.tw/ImagesUploads/5de09b72-8093-4659-84f6-f2bda1475cbd.jpg) |
| 說明 | 無 |

---

### 成功準則1.3.2：有意義的序列 (檢測等級A)

當內容中的呈現順序會影響其意義時，應該要能以程式化的方式，判讀正確的閱讀序列。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1513?Category=63) (另開新視窗)

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1578?Category=64) (另開新視窗)

**1.3.2 GN1130200E 將內容依據有意義的序列來排序**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1130200E |
| 對應成功準則 | 1.3.2 |
| 對應認證等級 | A |
| 對應國際技術碼 | G57 |
| 類別 | General |
| 訊息 | 將內容依據有意義的序列來排序 |
| 英文訊息 | G57: Ordering the content in a meaningful sequence |
| 規則說明 | 任何網頁都必須要遵守此指引。 |
| 檢測說明 | 1. 線性化你的網頁內容(例如使用線性化工具、或是手動移除任何排版的要素或屬性)。<br>2. 檢查此時網頁內容是否仍能保持其原本排版所想表達的樣子。<br>   <br>   ![網頁原本的設定](https://accessibility.moda.gov.tw/ImagesUploads/d4623aa6-f063-4e34-86ea-8bb4b5982f55.jpg)<br>(原本的網頁)<br>![原本程式碼的設定](https://accessibility.moda.gov.tw/ImagesUploads/aac847c4-d335-463f-87bf-bfb9b17e518b.jpg)<br>(原本的程式碼)<br>![移除排版元素的程式碼](https://accessibility.moda.gov.tw/ImagesUploads/553647c4-be32-4add-a487-78acd5c1e881.jpg)<br>(移除排版標籤的程式碼)<br>![移除排版元素以及屬性的網頁](https://accessibility.moda.gov.tw/ImagesUploads/8814f786-bf28-41df-93d0-3af167b317fe.jpg)<br>(移除排版標籤以及屬性的網頁。網頁內容變成由上到下排序，但網頁仍舊保持基本想傳達的訊息，不會因為位置改變而錯亂。) |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1579?Category=64) (另開新視窗)

**1.3.2 GN1130201E 使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向的問題**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1130201E |
| 對應成功準則 | 1.3.2 |
| 對應認證等級 | A |
| 對應國際技術碼 | H34 |
| 類別 | General |
| 訊息 | 使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向的問題 |
| 英文訊息 | H34: Using a Unicode right-to-left mark (RLM) or left-to-right mark (LRM) to mix text direction inline<br>H56: Using the dir attribute on an inline element to resolve problems with nested directional runs |
| 規則說明 | 任何需要同時顯示左至右的語言文字(例如英文)，以及右至左的語言文字(例如阿拉伯文)的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 檢查網頁內容是否有出現閱讀文字方向改變的情形。如果有，則找出其位置。<br>   <br>   ![檢查文字閱讀方向](https://accessibility.moda.gov.tw/ImagesUploads/5bf01480-cfaf-477d-bfbb-4ed137f007ad.jpg)<br>2. 當文字方向改變時，檢查緊貼在文字旁的中性的符號(沒有方向性的符號)，例如空白、標點符號等，是否出現在不對的位置。<br>   <br>   ![檢查符號位置](https://accessibility.moda.gov.tw/ImagesUploads/fa20ac31-8f33-4061-a439-b441282b105b.jpg)<br>3. 如果是，表示HTML的Bidirectional Algorithm將這些中性符號放在不對的位置，請檢查這些符號的後面是否有使用Unicode的right-to-left或left-to-right符號，以便讓中性符號顯示在正確的位置。<br>   <br>   ![檢查符號是否有使用Unicode符號](https://accessibility.moda.gov.tw/ImagesUploads/28f11510-ea27-40f5-87c1-52f76613eee6.jpg) |
| 說明 | 無 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1580?Category=64) (另開新視窗)

**1.3.2 CS1130202E 使用CSS來控制字詞內的字母間距**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS1130202E |
| 對應成功準則 | 1.3.2 |
| 對應認證等級 | A |
| 對應國際技術碼 | C8 |
| 類別 | CSS |
| 訊息 | 使用CSS來控制字詞內的字母間距 |
| 英文訊息 | C8: Using CSS letter-spacing to control spacing within a word |
| 規則說明 | 1. 任何使用CSS的網頁，都要遵守此指引。<br>2. 系統無法找出每個字元之間呈現不正常間格的字串 |
| 檢測說明 | 1. 找出每個字元之間呈現不正常間格的字串。<br>   <br>   ![檢視字元間隔](https://accessibility.moda.gov.tw/ImagesUploads/c97fb300-5929-4fb5-9047-35e1f7a2ad2c.jpg)<br>2. 檢查該字串是否使用CSS的letter-spacing屬性改變文字或字元間的間距。<br>   <br>   ![檢查是否有將CSS的letter-spacing屬性套用在該字串中](https://accessibility.moda.gov.tw/ImagesUploads/2e174164-323d-4180-ade4-96ff78e78043.jpg) |
| 說明 | 無 |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1581?Category=64) (另開新視窗)

**1.3.2 CS1130203E DOM物件順序需與視覺順序一致**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS1130203E |
| 對應成功準則 | 1.3.2 |
| 對應認證等級 | A |
| 對應國際技術碼 | C27 |
| 類別 | CSS |
| 訊息 | DOM物件順序需與視覺順序一致 |
| 英文訊息 | C27: Making the DOM order match the visual order<br>SCR21: Using functions of the Document Object Model (DOM) to add content to a page |
| 規則說明 | 任何在HTML或是XHTML使用CSS的網頁，都要遵守此指引。 |
| 檢測說明 | 1. 利用眼睛觀察網頁在一般使用者眼前時，每個物件所呈現的順序。<br>   <br>   ![物件呈現順序](https://accessibility.moda.gov.tw/ImagesUploads/94712910-d76e-4148-beb3-6654d4a63994.jpg)<br>2. 利用DOM工具得到網頁的DOM標籤<br>   <br>   ![網頁DOM元素](https://accessibility.moda.gov.tw/ImagesUploads/df9dcd2b-61dc-4224-939f-cc96cfb9f2df.jpg)<br>   <br>   <br>    (這是一個線上DOM工具，將網頁原始碼輸入，可以得到該網站的DOM結構 [https://software.hixie.ch/utilities/js/live-dom-viewer/](https://software.hixie.ch/utilities/js/live-dom-viewer/) \|)<br>3. 檢查DOM工具所呈現的物件，其順序是否與視覺上的順序相同。(對於一常見的英文或中文網站，視覺順序是由上到下、由左到右)<br>   <br>   ![檢視物件順序](https://accessibility.moda.gov.tw/ImagesUploads/e6dbcde1-a169-424d-91f0-9efc912b18e7.jpg) |
| 說明 | 無 |

---

### 成功準則1.3.3：知覺特徵 (檢測等級A)

用來理解及操作內容的指示，不可單獨依賴元件的形狀、尺寸、視覺位置、導向、聲音等知覺特徵。

#### 相關範例說明連結

##### [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1582?Category=64) (另開新視窗)

**1.3.3 GN1130300E 針對若無文字項目識別則必須仰賴感官資訊才能理解的內容，提供文字項目識別**

| 項目 | 內容 |
|------|------|
| 檢測碼 | GN1130300E |
| 對應成功準則 | 1.3.3 |
| 對應認證等級 | A |
| 對應國際技術碼 | G96 |
| 類別 | General |
| 訊息 | 針對若無文字項目識別則必須仰賴感官資訊才能理解的內容，提供文字項目識別 |
| 英文訊息 | G96: Providing textual identification of items that otherwise rely only on sensory information to be understood |
| 規則說明 | 任何在HTML或XHTML的網頁內，內容若無文字項目識別皆須感官資訊才能理解的內容，都須遵守此指引。 |
| 範例 | 1. 檢查網頁內的內容是否有無文字項目識別且須感官資訊才能理解的內容。<br>   <br>   ![檢查網頁內容](https://accessibility.moda.gov.tw/ImagesUploads/da2fb7bf-d865-43c9-b402-4f0c3f05d494.jpg)<br>2. 在內容裡提供文字項目識別。<br>   <br>   ![提供內容文字識別](https://accessibility.moda.gov.tw/ImagesUploads/1aed0869-be02-430f-86fa-e646003359fa.jpg) |
| 說明 | 無 |

---

### 成功準則1.3.4：螢幕方向 (檢測等級AA)

除非使用特定的顯示方向有其必要性，螢幕內容顯示和操作不應限制為單一顯示方向，例如直向或橫向。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1583?Category=64) (另開新視窗)

**1.3.4 GN2130400E 允許使用者可以使用不同方向操作控制元件**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2130400E |
| 對應成功準則 | 1.3.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G214 |
| 類別 | General |
| 訊息 | 允許使用者可以使用不同方向操作控制元件 |
| 英文訊息 | G214: Using a control to allow access to content in different orientations which is otherwise restricted |
| 規則說明 | 當提供者可能設定防止內容旋轉，需提供允許使用者旋轉內容的控制元件，讓需要使用特定方向的使用者能以舒適的方式查看內容。例如，無法握住裝置並將平板電腦安裝在輪椅或床上的使用者。 |
| 檢測說明 | 程序<br>對於旋轉裝置時不會改變方向的內容：<br>1. 檢查使用者介面中的控制元件以更改內容的方向。<br>2. 檢查操作控制元件時，內容是否改變方向。<br>預期結果<br>檢查#1和#2為是。 |
| 說明 | 相關技術<br>F97: Failure due to locking the orientation to landscape or portrait view |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1584?Category=64) (另開新視窗)

**1.3.4 FA2130401E 由於將螢幕方向鎖定到橫向或直向視圖而導致失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2130401E |
| 對應成功準則 | 1.3.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F97 |
| 類別 | Failure |
| 訊息 | 由於將螢幕方向鎖定到橫向或直向視圖而導致失敗 |
| 英文訊息 | F97: Failure due to locking the orientation to landscape or portrait view |
| 規則說明 | 將內容視圖限制為單一方向不允許以多個方向查看內容是失敗的設計，除非特定方向對於操作和查看內容具必要性。 |
| 檢測說明 | 程序<br>1. 在橫向視圖中打開內容，檢查內容是否對應此視圖方向。<br>2. 以直向視圖打開內容，檢查內容是否對應此視圖方向。<br>3. 檢查直向或橫向視圖對於查看和操作內容是否具備必要性。<br>4. 如果在內容、使用者代理(即瀏覽器)、作業系統或裝置中存在任何限制或允許方向更改的控制元件，則檢查控制元件可以設置，以檢查#1和#2為是。<br>預期結果<br>如果檢查#1或檢查#2為否，並且檢查#3和#4為否，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1585?Category=64) (另開新視窗)

**1.3.4 FA2130402E 有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2130402E |
| 對應成功準則 | 1.3.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F100 |
| 類別 | Failure |
| 訊息 | 有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗 |
| 英文訊息 | F100: Failure of Success Criterion 1.3.4 due to showing a message asking to reorient device |
| 規則說明 | 當網頁檢測到非預期的裝置方向時，顯示訊息告訴使用者重新定向裝置，而非網頁重新定向所有內容，因此導致的失敗情況。除非特定方向具必要性。 |
| 檢測說明 | 程序<br>1. 在橫向視圖中打開內容。檢查是否出現訊息要求將裝置重新定向。<br>2. 在直向視圖中打開內容。檢查是否出現訊息要求將裝置重新定向。<br>3. 檢查直向或橫向視圖對於內容的查看和操作是否必需。<br>預期結果<br>如果檢查#1或#2為是，並且檢查#3為否，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 無 |

---

### 成功準則1.3.5：識別輸入目的 (檢測等級AA)

收集有關使用者資訊之輸入欄位，可於下列狀況時以程式化確定：

- 輸入欄位的使用目的已在使用者介面元件的輸入目的區段中識別；以及
- 使用支援識別預期含義的表單輸入技術來實現內容取得。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1586?Category=64) (另開新視窗)

**1.3.5 HM2130500E 使用HTML 5.2自動完成(autocomplete)屬性**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM2130500E |
| 對應成功準則 | 1.3.5 |
| 對應認證等級 | AA |
| 對應國際技術碼 | H98 |
| 類別 | HTML |
| 訊息 | 使用HTML 5.2自動完成之屬性 |
| 英文訊息 | H98: Using HTML 5.2 autocomplete attributes |
| 規則說明 | 在表單上的每個表單字段中添加適當的自動完成符記(autocomplete token)，以使已確認的輸入可由程式化確定。<br>**安全注意事項**<br>組織可能會擔心允許自動填寫輸入字段。有時對於瀏覽器如何保存資訊及其安全隱患感到困惑。<br>對於自動完成屬性：<br>- 本技術僅用於向 填寫表單使用者本人 要求填寫資料時，非要求其他人的資料。<br>- 本技術 僅在同一台電腦、同一使用者帳戶及使用相同的瀏覽器時才有效<br>- 通常是在第一次保存資料時，由使用者可選擇儲存自動輸入的資訊<br>- 表單非自動提交，使用者可以在提交之前查看資料<br>- 在瀏覽器設定中可輕易的移除歷史記錄和表單資料<br>- 可輕易啟用無痕瀏覽模式<br>- 即使沒有自動完成<autocomplete>，瀏覽器亦可儲存資料，且某些附加元件，如密碼管理工具也會提供資料，惟<autocomplete>可提供精準的欄位資料 |
| 檢測說明 | 程序<br>對於每個表單字段，它收集有關用戶的信息並對應於WCAG 2.1中描述的自動完成字段(autocomplete field)第7節：使用者介面組件的輸入目的(Input Purposes for User Interface Components)，檢查以下內容：<br>1. 表單字段具有有效且格式良好的自動完成屬性與值。<br>2. 標籤指示的表單字段的用途與輸入上的自動完成符記相對應。<br>預期結果<br>如果#1和#2為是，則通過。 |
| 說明 | 相關技術<br>[HTML 5.2 autofill tokens](https://www.w3.org/TR/WCAG21/#input-purposes) \| (https://www.w3.org/TR/WCAG21/#input-purposes) |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1587?Category=64) (另開新視窗)

**1.3.5 FA2130501E 由於自動完成(autocomplete)屬性值不正確，而導致成功準則1.3.5失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2130501E |
| 對應成功準則 | 1.3.5 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F107 |
| 類別 | Failure |
| 訊息 | 由於自動完成屬性值不正確，而導致成功準則1.3.5失敗 |
| 英文訊息 | F107: Failure of Success Criterion 1.3.5 due to incorrect autocomplete attribute values |
| 規則說明 | 表單輸入對於請求有關表單使用者資訊的輸入，沒有正確的自動完成屬性值，而導致錯誤。 |
| 檢測說明 | 程序<br>對於收集有關表單使用者資訊的每個表單輸入字段：<br>1. 檢查表單輸入字段的自動完成屬性和資料值是否與輸入的目的不匹配。<br>2. 檢查輸入目的是否未通過任何其他方法以程式化方式傳達。<br>預期結果<br>如果檢查#1與#2為真，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 參考資源<br>- WCAG 2.1 - Input Purposes for User Interface Components(https://www.w3.org/TR/WCAG21/#input-purposes)<br>- The HTML5 autocomplete attribute(https://www.w3.org/TR/html52/sec-forms.html#sec-autofill)<br>相關技術<br>- H98: Using HTML 5.2 autocomplete attributes |

---

### 成功準則1.3.6：識別目的 (檢測等級AAA)

在使用標記語言實現的內容中，使用者介面元件、圖示和區域的用途可以透過程式化確定。

#### 相關範例說明連結

- [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1588?Category=64) (另開新視窗)

---

## 指引1.4：可辨識

**讓使用者能更容易地看見及聽到內容、區分前景和背景**

### 說明

有些指引著重在使資訊能有可以替代格式來呈現，本指引則是想讓預設的呈現方式能讓有障礙的使用者也能容易感知。使這件事容易的主要焦點在於讓使用者能容易地將前景資訊從背景當中分出來。就視覺呈現來說，這牽涉到確保背景上的前景資訊能有充足的對比；就聽覺呈現來說，這牽涉到確保背景聲音中的前景資訊能有夠大的音量。網頁設計者應留意到：視力障礙者和聽力障礙者要從背景中分離出前景資訊時，會比其他人更為困難。

### 成功準則1.4.1：色彩使用 (檢測等級A)

色彩不可當做唯一能傳達資訊、提出動作、提請回應或區別視覺元件的視覺手段來使用。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1589?Category=64) (另開新視窗)

**1.4.1 GN1140100E 確保所有藉由顏色所傳達出來的訊息，在沒有顏色後仍然能夠傳達出來**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | EV1040100 |
| 對應成功準則 | 1.4.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G14 |
| 類別 | General |
| 訊息 | 確保所有藉由顏色所傳達出來的訊息，在沒有顏色後仍然能夠傳達出來 |
| 英文訊息 | G14: Ensuring that information conveyed by color differences is also available in text<br>G111: Using color and pattern<br>G182: Ensuring that additional visual cues are available when text color differences are used to convey information<br>G183: Using a contrast ratio of 3:1 with surrounding text and providing additional visual cues on focus for links or controls where color alone is used to identify them |
| 規則說明 | 任何技術運用文字和顏色傳達訊息的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用chrome開啟檔案，大多數的使用者可以經由顏色的差異得到傳達的信息，但有些使用者無法辨識顏色的也可以經由文字內容來判斷。<br>   <br>   ![使用chrome開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/1318b654-5c47-43da-8954-5eb599ea29da.jpg)<br>2. 檢視原始碼，上方的紅色框的required部分為紅色字部分的程式碼，此為使用CSS的方法來改變文字顏色，下方紅色框使用另一種程式碼來指定顏色，此部分指定文字顯示綠色。<br>   <br>   ![檢視原始碼設定](https://accessibility.moda.gov.tw/ImagesUploads/ac53e3e0-c89b-46c5-a206-cc2158178bf2.jpg)<br>3. 若去掉以上紅色框出部分的程式碼，則會顯示原來預設的顏色。<br>   <br>   ![預設顏色樣式](https://accessibility.moda.gov.tw/ImagesUploads/09c1eeed-1efa-4fa5-a97a-f4ae2b348701.jpg) |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1590?Category=64) (另開新視窗)

**1.4.1 CS1140101E 當使用者介面元件取得焦點時，使用CSS變更其呈現方式**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS1140101E |
| 對應成功準則 | 1.4.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | C15 |
| 類別 | CSS |
| 訊息 | 當使用者介面元件取得焦點時，使用CSS變更其呈現方式 |
| 英文訊息 | C15: Using CSS to change the presentation of a user interface component when it receives focus |
| 規則說明 | 任何運用CSS來改變呈現方式的HTML或XHTML網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用chrome 開啟檔案。<br>   <br>   ![使用chrome開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/287cd700-4c4a-4860-9355-c26f235efef4.jpg)<br>2. 檢查HTML的網頁是否有引用CSS，可改變滑鼠指標所指向的背景顏色。<br>   <br>   ![檢查HTML的網頁是否有引用CSS](https://accessibility.moda.gov.tw/ImagesUploads/b0e5cb9f-3327-4eaf-8c06-74af157ed06b.jpg)<br>3. 檢查原始碼 CSS設定背景色的部分。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/d754aa3e-8b61-4f98-a9f0-00cb7e5935e4.jpg) |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1591?Category=64) (另開新視窗)

**1.4.1 GN1140102E 對有顏色的表單控制標題，提供文字線索提示**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN1140102E |
| 對應成功準則 | 1.4.1 |
| 對應認證等級 | A |
| 對應國際技術碼 | G205 |
| 類別 | General |
| 訊息 | 對有顏色的表單控制標題，提供文字線索提示 |
| 英文訊息 | G205: Including a text cue for colored form control labels |
| 規則說明 | 有顏色表單控制標題，需要有文字提示，否則檢測失敗；亦即，若表單控制標題有特別顏色存在，檢查其是否有適當的文字提示，若有適當文字提示，則通過檢測。 |
| 檢測說明 | 1. 使用文字required代替紅色字體來提供線索提示<br>   <br>   ![使用required的示意圖](https://accessibility.moda.gov.tw/ImagesUploads/b6248c79-99d2-4506-8fbf-eb537ace6370.jpg)<br>2. 原始碼<br>   <br>   <br>    <label for="lastname" class="required">Last name (required): </label><br>   <br>   <br>    <input id="lastname" type="text" size="25" value=""/><br>   <br>   <br>    <style type="text/css"><br>   <br>   <br>      .required {<br>   <br>   <br>        color:red;<br>   <br>   <br>      }<br>   <br>   <br>    </style> |
| 說明 | 無 |

---

### 成功準則1.4.2：音訊控制 (檢測等級A)

如果網頁上有任何音訊會自動播放達3秒鐘以上，應提供一套機制來暫停或中止音訊播放，或者要能在整體系統音量設定外，另外提供控制音量的機制。

#### 相關範例說明連結

- [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1592?Category=64) (另開新視窗)

### 成功準則1.4.3：對比值(最小) (檢測等級AA)

除非是下列各款中的例外情形，否則文字及影像文字的視覺呈現，至少要有4.5:1的對比值：

- 大尺寸的文字及大尺寸的影像文字至少要有3:1的對比值。
- 閒置中的使用介面元件上的、純裝飾用的、任何人都看不到的文字或影像文字，或者只是另一張圖片的局部且該圖片顯然還有其他視覺內容，都毋須要求對比值。
- 標識或商標名稱上的字樣沒有最小對比值的要求。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1593?Category=64) (另開新視窗)

**1.4.3 GN2140300E 確認文字(及影像文字)與文字後面的背景間，至少有4.5:1的對比值**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2140300E |
| 對應成功準則 | 1.4.3 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G18 |
| 類別 | General |
| 訊息 | 確認文字(及影像文字)與文字後面的背景間，至少有4.5:1的對比值 |
| 英文訊息 | G18: Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text |
| 規則說明 | 所有網頁的文字背景都必須採取此指引。 |
| 檢測說明 | 1. 檢查網頁中是否存在文字內容。<br>2. 檢查網頁元件中文字和文字背景中的對比值，確認至少有4.5:1的對比值。<br>   <br>   ![影像文字範例](https://accessibility.moda.gov.tw/ImagesUploads/08661a89-7a41-4474-ad53-5f338f7d406c.jpg) |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1594?Category=64) (另開新視窗)

**1.4.3 GN2140301E 確認大尺寸文字(及影像文字)與文字後面的背景間，至少有3:1的對比值**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2140301E |
| 對應成功準則 | 1.4.3 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G145 |
| 類別 | General |
| 訊息 | 確認大尺寸文字(及影像文字)與文字後面的背景間，至少有3:1的對比值 |
| 英文訊息 | G145: Ensuring that a contrast ratio of at least 3:1 exists between text (and images of text) and background behind the text |
| 規則說明 | 所有網頁的文字背景都必須遵守此指引。 |
| 檢測說明 | 1. 檢查網頁中是否存在大尺寸文字內容。<br>2. 檢查網頁元件中大尺寸文字和文字背景中的對比值，確認至少有3:1的對比值。<br>   <br>   ![影像文字範例](https://accessibility.moda.gov.tw/ImagesUploads/6bc6c895-caed-4764-9767-aec5afd059ea.jpg) |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1595?Category=64) (另開新視窗)

**1.4.3 GN2140302E 提供具對比值至少4.5:1，且可讓使用者將呈現切換成具有充分對比值(文字及影像文字至少4.5:1，大尺寸文字及影像文字至少3:1)的控制元件**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2140302E |
| 對應成功準則 | 1.4.3 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G174 |
| 類別 | General |
| 訊息 | 提供具對比值至少4.5:1，且可讓使用者將呈現切換成具有充分對比值(文字及影像文字至少4.5:1，大尺寸文字及影像文字至少3:1)的控制元件 |
| 英文訊息 | G174: Providing a control with a sufficient contrast ratio that allows users to switch to a presentation that uses sufficient contrast |
| 規則說明 | 所有網頁中的文字元件都必須遵守此指引。 |
| 檢測說明 | 1. 檢查網頁元件中是否存在文字元件。<br>2. 檢查是否存在元件可將文字和背景的對比值轉換至少4.5:1，大尺寸文字及影像至少3:1。 |
| 說明 | 無 |

---

- [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1596?Category=64) (另開新視窗)

### 成功準則1.4.4：調整文字尺寸 (檢測等級AA)

除字幕及影像文字外，文字在沒有額外輔助科技的情況下，要能夠放大至百分之兩百，而不會失去內容或功能性。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1528?Category=63) (另開新視窗)

**1.4.4 CS2140401C 任何CSS樣式規則均使用具名字型尺寸，或者使用百分比或em等相對字型尺寸單位**

| 項目 | 內容 |
|------|------|
| 檢測碼 | CS2140401C |
| 對應成功準則 | 1.4.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C12 |
| 類別 | CSS |
| 訊息 | 任何CSS樣式規則均使用具名字型尺寸，或者使用百分比或em等相對字型尺寸單位 |
| 英文訊息 | C12: Using percent for font sizes<br>C13: Using named font sizes<br>C14: Using em units for font sizes |
| 規則說明 | 如果CSS樣式內存在font-size屬性且使用具名或相對(如使用百分比或em)的字型尺寸，通過檢測，否則檢測失敗。 |
| 範例 | 範例1：<br>strong {font-size: 1.6em}<br>…<br><h1>讓<strong>使用者</strong>控制文字尺寸</h1><br><p>讓使用者能知道如何控制文字尺寸是<strong>非常 </strong>重要的</p><br>範例2：<br>strong {font-size: larger}<br>…<br><h1>讓<strong>使用者</strong>控制文字尺寸</h1><br><p>讓使用者能知道如何控制文字尺寸是<strong>非常 </strong>重要的</p><br>範例3：<br>strong {font-size: 120%}<br>…<br><h1>讓<strong>使用者</strong>控制文字尺寸</h1><br><p>讓使用者能知道如何控制文字尺寸是<strong>非常 </strong>重要的</p> |
| 說明 | 範例1說明：CSS樣式規則使用了em相對字型尺寸單位。<br>範例2說明：CSS樣式規則使用了larger具名字型尺寸單位。<br>範例3說明：CSS樣式規則使用了百分比相對字型尺寸單位。 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1597?Category=64) (另開新視窗)

**1.4.4 GN2140400E 使用具有支援縮放功能且容易取得的使用者代理的科技，或者在頁面上提供可讓使用者變大所有文字尺寸到百分之兩百為止的控制元件**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2140400E |
| 對應成功準則 | 1.4.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G142 |
| 類別 | General |
| 訊息 | 使用具有支援縮放功能且容易取得的使用者代理的科技，或者在頁面上提供可讓使用者變大所有文字尺寸到百分之兩百為止的控制元件 |
| 英文訊息 | G142: Using a technology that has commonly-available user agents that support zoom<br>G178: Providing controls on the Web page that allow users to incrementally change the size of all text on the page up to 200 percent<br>SCR34: Calculating size and position in a way that scales with text size |
| 規則說明 | 所有網頁元件必須符合此指引。 |
| 檢測說明 | 1. 將所需的網頁用Google Chrome、IE、Opera這些具有提供放大縮小功能的網頁瀏覽器開啟。<br>2. 將網頁透過瀏覽器或是網頁提供的放大功能放大至200%。<br>   <br>   ![網頁放大功能調整](https://accessibility.moda.gov.tw/ImagesUploads/f52b79ed-4ca9-4351-9624-01109ae2ae24.jpg)<br>3. 檢查是否所有元件都可以適用於此放大縮小技術。 |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1598?Category=64) (另開新視窗)

**1.4.4 GN2140401E 使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2140401E |
| 對應成功準則 | 1.4.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G146 |
| 類別 | General |
| 訊息 | 使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能 |
| 英文訊息 | G146: Using liquid layout<br>G179: Ensuring that there is no loss of content or functionality when the text resizes and text containers do not change their width |
| 規則說明 | 所有設計有流動版面的網頁都必須遵守此指引。 |
| 檢測說明 | 1. 使用工具將網頁打開。<br>2. 放大網頁頁面至200%。<br>   <br>   ![頁面放大至200%](https://accessibility.moda.gov.tw/ImagesUploads/bf93c84c-b4cc-461f-b992-e15251c301e0.jpg)<br>3. 檢查所有網頁元件的功能是否能正常執行。 |
| 說明 | 無 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1599?Category=64) (另開新視窗)

**1.4.4 CS2140402E 縮放含有文字的表單組件**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2140402E |
| 對應成功準則 | 1.4.4 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C17 |
| 類別 | CSS |
| 訊息 | 縮放含有文字的表單組件 |
| 英文訊息 | C17: Scaling form elements which contain text |
| 規則說明 | 所有網頁中提供需要額外輸入的欄位都必須遵守此指引。 |
| 檢測說明 | 1. 對表單中的欄位輸入文字。<br>2. 將整體內容透過瀏覽器或是網頁提供的功能放大200%。<br>   <br>   ![放大網頁內容](https://accessibility.moda.gov.tw/ImagesUploads/6db8d8a9-bec5-42ca-8044-478ceb8b4d8e.jpg)<br>3. 檢查表單中輸入的文字是否也等比例被放大。 |
| 說明 | 無 |

---

### 成功準則1.4.5：影像文字 (檢測等級AA)

如果所運用的科技能夠達成所需的視覺呈現，應以文字來傳遞資訊，而不要用影像文字，除非是下列各款中的例外情形：

- 影像文字在視覺上能根據使用者的需求而自訂。
- 使用特定方式呈現的文字對於資訊的傳達有其必要性。

#### 相關範例說明連結

- [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1600?Category=64) (另開新視窗)

### 成功準則1.4.6：對比值(增強) (檢測等級AAA)

除非是下列各款中的例外情況，否則文字及影像文字的視覺呈現至少要有7:1的對比值：

- 大尺寸的文字及大尺寸的影像文字至少要有4.5:1的對比值。
- 閒置中的使用介面元件上的、純裝飾用的、任何人都看不到的文字或影像文字，或者只是另1張圖片的局部且該圖片顯然還有其他視覺內容，都毋須要求對比值。
- 標識或商標名稱上的字樣沒有最小對比值的要求。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1601?Category=64) (另開新視窗)

**1.4.6 GN3140600E 確認文字(及影像文字)與文字後面的背景間，至少有7:1的對比值**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3140600E |
| 對應成功準則 | 1.4.6 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G17 |
| 類別 | General |
| 訊息 | 確認文字(及影像文字)與文字後面的背景間，至少有7:1的對比值。 |
| 英文訊息 | G17: Ensuring that a contrast ratio of at least 7:1 exists between text (and images of text) and background behind the text |
| 規則說明 | 所有網頁中的元件都必須遵守此指引。 |
| 檢測說明 | 1. 檢查網頁元件是否存在文字或影像文字。<br>2. 檢查文字和其文字背景間的對比值是否高於7:1。![影像文字範例](https://accessibility.moda.gov.tw/ImagesUploads/adb16711-852d-4903-9ecb-268ddbbab97f.jpg) |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1602?Category=64) (另開新視窗)

**1.4.6 GN3140601E 確認大尺寸文字(及影像文字)與文字後面的背景間，至少有4.5:1的對比值**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3140601E |
| 對應成功準則 | 1.4.6 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G18 |
| 類別 | General |
| 訊息 | 確認大尺寸文字(及影像文字)與文字後面的背景間，至少有4.5:1的對比值。 |
| 英文訊息 | G18: Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text |
| 規則說明 | 所有網頁中的元件都必須遵守此指引。 |
| 檢測說明 | 1. 檢查網頁元件是否存在文字或影像文字。<br>2. 檢查大尺寸文字和其文字背景間的對比值是否高於4.5:1。<br>   <br>   ![影像文字範例](https://accessibility.moda.gov.tw/ImagesUploads/9b024558-62ba-4b9c-9d7e-9885f2ac7d0f.jpg) |
| 說明 | 無 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1603?Category=64) (另開新視窗)

**1.4.6 GN3140602E 提供具對比值至少7:1，且可讓使用者將呈現切換成具有充分對比值(文字及影像文字至少7:1，大尺寸文字及影像文字至少4.5:1)的控制元件**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3140602E |
| 對應成功準則 | 1.4.6 |
| 對應認證等級 | A |
| 對應國際技術碼 | G174 |
| 類別 | General |
| 訊息 | 提供具對比值至少7:1，且可讓使用者將呈現切換成具有充分對比值(文字及影像文字至少7:1，大尺寸文字及影像文字至少4.5:1)的控制元件。 |
| 英文訊息 | G174: Providing a control with a sufficient contrast ratio that allows users to switch to a presentation that uses sufficient contrast |
| 規則說明 | 所有網頁中文字及影像文字至少7:1，大尺寸文字及影像文字至少4.5:1之控制元件都必須遵守此指引。 |
| 檢測說明 | 1. 檢查連結或控制元件，在原始頁面上的存在。<br>2. 檢查原始頁面上的連結或控制符合所有成功的標準一致性水平，並進行測試。<br>3. 檢查其他頁面滿足了對比度和被測試的所有其他成功標準的一致性程度。 |
| 說明 | 無 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1604?Category=64) (另開新視窗)

**1.4.6 GN3140603E 如果無法確認對比值充分(文字及影像文字至少7:1，大尺寸文字及影像文字至少4.5:1)，則不要指定背景色彩，也不要指定前景色彩，而且不要使用會變更這些預設值的科技功能**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3140603E |
| 對應成功準則 | 1.4.6 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G148 |
| 類別 | General |
| 訊息 | 如果無法確認對比值充分(文字及影像文字至少7:1，大尺寸文字及影像文字至少4.5:1)，則不要指定背景色彩，也不要指定前景色彩，而且不要使用會變更這些預設值的科技功能。 |
| 英文訊息 | G148: Not specifying background color, not specifying text color, and not using technology features that change those defaults |
| 規則說明 | 所有網頁中的文字元件都必須遵守此指引。 |
| 檢測說明 | 1. 查看該文本顏色可以指定所有的地方。<br>2. 檢查文本顏色未被指定。<br>3. 查看作為背景的背景顏色或圖片可以被指定。<br>4. 檢查被指定的背景沒背景顏色或圖片。 |
| 說明 | 無 |

---

### 成功準則1.4.7：低或無背景音訊 (檢測等級AAA)

如果預先錄製的純音訊內容，前景主要為語音；不是音訊CAPTCHA驗證或音訊商標；而且不是歌唱或rap等用於音樂表達的發音，則下列各款中至少得做到其中一項：

- 音訊不含任何背景聲音。
- 背景聲音可以關掉。
- 除偶爾出現且僅持續1到兩秒的音效之外，背景聲音至少要比前景的語音內容低20分貝。根據「分貝」的定義，符合此要求的背景聲音大約會比前景語音內容安靜4倍左右。

#### 相關範例說明連結

- [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1605?Category=64) (另開新視窗)

### 成功準則1.4.8：視覺呈現 (檢測等級AAA)

對於文字區塊的視覺呈現，提供機制來達成下列事項：

- 使用者可選擇前景及背景色彩。
- 寬度不可多於80個字元或字符(中日韓語系則是40)。
- 文字不可全齊(左右邊界均對齊)。
- 段落內的行距至少要是1.5倍行高，而段落間距則至少要是1.5倍行距。
- 在沒有額外輔助科技的情況下，文字要能夠放大至百分之兩百，並且在全螢幕視窗中閱讀時，使用者毋須水平捲動視窗即可讀。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1530?Category=63) (另開新視窗)

**1.4.8 CS3140800C 僅有單一樣式表、使用者無法切換替代樣式表的情況下，不得指定主要內容之文字色彩與背景色彩**

| 項目 | 內容 |
|------|------|
| 檢測碼 | CS3140800C |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C23 |
| 類別 | CSS |
| 訊息 | 僅有單一樣式表、使用者無法切換替代樣式表的情況下，不得指定主要內容之文字色彩與背景色彩 |
| 英文訊息 | C23: Specifying text and background colors of secondary content such as banners, features and navigation in CSS while not specifying text and background colors of the main content<br>G148: Not specifying background color, not specifying text color, and not using technology features that change those defaults |
| 規則說明 | 如果在CSS樣式表中沒有指定主要內容的文字顏色(text color)與背景顏色(background color)，通過檢測，否則檢測失敗。 |
| 範例 | 無 |
| 說明 | 開發者不使用CSS控制文字顏色和背景顏色，目的是為了瀏覽器對於此提供了預設顏色和對比。 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1531?Category=63) (另開新視窗)

**1.4.8 CS3140801C 需有CSS樣式規則使用百分比數值或相對長度單位來設定欄寬，且最大欄寬不得超過80個字母(中日韓語系的40個文字)**

| 項目 | 內容 |
|------|------|
| 檢測碼 | CS3140801C |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C20 |
| 類別 | CSS |
| 訊息 | 需有CSS樣式規則使用百分比數值或相對長度單位來設定欄寬，且最大欄寬不得超過80個字母(中日韓語系的40個文字) |
| 英文訊息 | C20: Using relative measurements to set column widths so that lines can average 80 characters or less when the browser is resized<br>C24: Using percentage values in CSS for container sizes |
| 規則說明 | 如果設定欄寬的標籤存在且對應的CSS內的width屬性值不為空並以相對尺寸為單位或max-width屬性值不超過80個字母的寬度或以相對尺寸為單位，通過檢測，否則檢測失敗。 |
| 範例 | 範例1：<br>HTML程式碼部分<br><div id="main_content"><br><p>今天天氣真好</p><br></div><br>CSS 部分<br>#main_content {max-width: 70em;}<br>範例2：<br>HTML程式碼部分<br><div id="main_content"><br><p>今天天氣真好</p><br></div><br>CSS 部分<br>#main_content {width: 90%;} |
| 說明 | 範例1說明：<br>HTML程式碼部分<br><div>是用來設定區塊的標籤，可以透過CSS設定文字與圖片的間距。 存在設定最大欄寬的標籤<div>，main_content為識別碼名稱。<br>CSS 部分<br>對應的CSS內的max-width尺寸使用em相對尺寸，在調整瀏覽器顯示尺寸後，區塊寬度也會依照顯示比例進行調整。<br>範例2說明：<br>HTML程式碼部分<br><div>是用來設定區塊的標籤，可以透過CSS設定文字與圖片的間距。存在設定最大欄寬的標籤<div>，main_content為識別碼名稱。<br>CSS 部分<br>對應的CSS內的max-width尺寸使用%相對尺寸，在調整瀏覽器顯示尺寸後，區塊寬度也會依照顯示比例進行調整。 |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1532?Category=63) (另開新視窗)

**1.4.8 CS3140802C 需有CSS樣式規則指定行距**

| 項目 | 內容 |
|------|------|
| 檢測碼 | CS3140802C |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C21 |
| 類別 | CSS |
| 訊息 | 需有CSS樣式規則指定行距 |
| 英文訊息 | C21: Specifying line spacing in CSS |
| 規則說明 | 如果某標籤內有文字內容且在CSS中存在此標籤的行距設定，通過檢測，否則檢測失敗。 |
| 範例 | HTML程式碼部分<br><p>文章內容</p><br>CSS 部分<br>p { line-height: 150%; } |
| 說明 | HTML程式碼部分<br>顯示段落<p>標籤的存在，且內容不為空。<br>CSS 部分<br>對應<p>標籤的樣式規則設定行距高度為預設值的150%。<br>這裡的設定就是將文章段落內的行距放大到原本的150%。 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1606?Category=64) (另開新視窗)

**1.4.8 GN3140800E 使用能夠變更文字區塊前景與背景且容易取得的使用者代理的科技，或者在頁面上提供前景色彩與背景色彩的多重色彩選取工具**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3140800E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G156 |
| 類別 | General |
| 訊息 | 使用能夠變更文字區塊前景與背景且容易取得的使用者代理的科技，或者在頁面上提供前景色彩與背景色彩的多重色彩選取工具 |
| 英文訊息 | G156: Using a technology that has commonly-available user agents that can change the foreground and background of blocks of text<br>G175: Providing a multi color selection tool on the page for foreground and background colors |
| 規則說明 | 任何讓使用者儲存個人偏好去產生多重色彩選取工具技術的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用chrome打開檔案。<br>   <br>   ![使用Chrome開啟檔案](https://accessibility.moda.gov.tw/ImagesUploads/61d45d05-c8bd-4eba-bc80-e0e32be62806.jpg)<br>2. 前景：選色可改變前景顏色，而背景：選色可改變背景顏色，這邊以前景#6C0和背景#903為例。<br>   <br>   ![改變前景顏色](https://accessibility.moda.gov.tw/ImagesUploads/baa6dc5a-c8ff-483c-9a46-a0917f703bb7.jpg)<br>3. 檢視原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/485f951c-9375-4b4d-8115-430fc7c9a305.jpg) |
| 說明 | 無 |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1607?Category=64) (另開新視窗)

**1.4.8 CS3140801E 如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS3140801E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C23 |
| 類別 | CSS |
| 訊息 | 如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能 |
| 英文訊息 | G148: Not specifying background color, not specifying text color, and not using technology features that change those defaults<br>C23: Specifying text and background colors of secondary content such as banners, features and navigation in CSS while not specifying text and background colors of the main content |
| 規則說明 | 所有網頁中的文字元件都必須遵守此指引。 |
| 檢測說明 | 1. 查看該文本顏色可以指定所有的地方。<br>2. 檢查文本顏色未被指定。<br>3. 查看作為背景的背景顏色或圖片可以被指定。<br>4. 檢查被指定的背景沒背景顏色或圖片。 |
| 說明 | 無 |

---

##### [範例說明6](https://accessibility.moda.gov.tw/Download/Detail/1608?Category=64) (另開新視窗)

**1.4.8 CS3140802E 在CSS當中劃分區域時僅指定邊框與版面，不要指定文字色彩及文字背景色彩**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS3140802E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C25 |
| 類別 | CSS |
| 訊息 | 在CSS當中劃分區域時僅指定邊框與版面，不要指定文字色彩及文字背景色彩 |
| 英文訊息 | C25: Specifying borders and layout in CSS to delineate areas of a Web page while not specifying text and text-background colors |
| 規則說明 | 任何在CSS當中劃分區域時僅指定邊框與版面的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 使用chrome打開檔案，指定各種邊框的設定，例如此頁面有虛線以及實線的邊框。<br>   <br>   ![指定邊框設定](https://accessibility.moda.gov.tw/ImagesUploads/4cd240b5-9192-4a10-bf5b-1023b7e66c59.jpg)<br>2. 檢視原始碼，對各個圖片給予不同的邊框設定。<br>   <br>   ![針對各圖片設定邊框](https://accessibility.moda.gov.tw/ImagesUploads/aeedb79a-a584-44ac-ad30-f9993998391b.jpg) |
| 說明 | 無 |

---

##### [範例說明7](https://accessibility.moda.gov.tw/Download/Detail/1609?Category=64) (另開新視窗)

**1.4.8 CS3140803E 文字僅對齊某一邊，或提供可移除文字左右全齊的機制**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS3140803E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C19 |
| 類別 | CSS |
| 訊息 | 文字僅對齊某一邊，或提供可移除文字左右全齊的機制 |
| 英文訊息 | G169: Aligning text on only one side<br>G172: Providing a mechanism to remove full justification of text<br>C19: Specifying alignment either to the left OR right in CSS |
| 規則說明 | 任何技術關於控制文字對齊功能的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 用chrome打開檔案，可依按鈕指示變更文字對齊的位置，分別為左、中、右，預設為左邊對齊。<br>   <br>   ![變更Chrome瀏覽器中的文字位置](https://accessibility.moda.gov.tw/ImagesUploads/6251404b-677d-4036-9832-af5c6d470af4.jpg)<br>2. 按"中"的按鈕，可使文字以置中方式對齊。<br>   <br>   ![按中按鈕可將文字製中](https://accessibility.moda.gov.tw/ImagesUploads/532ba2ca-32c7-40d0-889a-6cf225177bd4.jpg)<br>3. 按"右"的按鈕，可使文字靠右邊對齊。<br>   <br>   ![按中按鈕可將文字製中](https://accessibility.moda.gov.tw/ImagesUploads/532ba2ca-32c7-40d0-889a-6cf225177bd4.jpg)<br>4. 點選"預設"的按鈕，可跳回初始狀態。<br>   <br>   ![以預設按鈕回復初始設定](https://accessibility.moda.gov.tw/ImagesUploads/adeb77ac-a38d-4ad0-8646-2939e3f75378.jpg)<br>5. 檢視原始碼，使用javascript去控制按鈕的對齊方向。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/d5fbcb9a-1ca4-438f-87a8-535e3f32623d.jpg) |
| 說明 | 無 |

---

##### [範例說明8](https://accessibility.moda.gov.tw/Download/Detail/1610?Category=64) (另開新視窗)

**1.4.8 CS3140804E 在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS3140804E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C21 |
| 類別 | CSS |
| 訊息 | 在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間 |
| 英文訊息 | C21: Specifying line spacing in CSS |
| 規則說明 | 任何技術關於在CSS當中指定行距(介於1.5倍行高至2倍行高之間)的網頁，皆須遵從此指引。 |
| 檢測說明 | 1. 用chrome打開檔案，行距設為line-height:2.0。<br>   <br>   ![行距設定line-height:2.0](https://accessibility.moda.gov.tw/ImagesUploads/5b9776f9-a480-4035-ae6b-387347f522fe.jpg)<br>2. 更改原始碼，設成line-height:1.5。<br>   <br>   ![更改原始碼為line-height:1.5](https://accessibility.moda.gov.tw/ImagesUploads/0fba4046-5db8-4b62-b315-5286d2f2e872.jpg)<br>3. 檢視原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/0b683b76-0364-4fd7-8425-035fa6afb7a9.jpg) |
| 說明 | 無 |

---

##### [範例說明9](https://accessibility.moda.gov.tw/Download/Detail/1611?Category=64) (另開新視窗)

**1.4.8 GN3140805E 在網頁上提供可以增加行距及段落間距的按鈕**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN3140805E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G188 |
| 類別 | General |
| 訊息 | 在網頁上提供可以增加行距及段落間距的按鈕。 |
| 英文訊息 | G188: Providing a button on the page to increase line spaces and paragraph spaces |
| 規則說明 | 任何技術關於提供行距及段落間距的網頁，皆須遵從此指引。 |
| 檢測說明 | 1. 用chrome打開檔案，此為初始的行距。<br>   <br>   ![檢視初始行距](https://accessibility.moda.gov.tw/ImagesUploads/62dfe718-51f3-4718-b70c-dca98804068b.jpg)<br>2. 點選行距可改變大小，以點選小為例，為原本行距的120%。<br>   <br>   ![點選行距可調整大小](https://accessibility.moda.gov.tw/ImagesUploads/43c0be7f-125c-42de-a5cf-d5a0a60adfa6.jpg)<br>3. 點選行距可改變大小，以點選大為例，為原本行距的180%。<br>   <br>   ![點選行距拉大為原本的180%](https://accessibility.moda.gov.tw/ImagesUploads/3013fdcd-6cc9-43c4-aef0-b130857a0b59.jpg)<br>4. 檢視原始碼，此為調整行距所用javascrpit的程式碼。<br>   <br>   ![調整行距使用javascript程式碼](https://accessibility.moda.gov.tw/ImagesUploads/eb6b5790-866f-43c6-8a0e-8d587fc3afc0.jpg) |
| 說明 | 無 |

---

##### [範例說明10](https://accessibility.moda.gov.tw/Download/Detail/1612?Category=64) (另開新視窗)

**1.4.8 HM3140806E 除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代理的文字重新流向**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | HM3140806E |
| 對應成功準則 | 1.4.8 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | G204 |
| 類別 | HTML |
| 訊息 | 除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代理的文字重新流向 |
| 英文訊息 | G204: Not interfering with the user agent's reflow of text as the viewing window is narrowed<br>G206: Providing options within the content to switch to a layout that does not require the user to scroll horizontally to read a line of text |
| 規則說明 | 任何在HTML和XHTML中讓使用者可以切換到無需水平捲動即可閱讀整行文字版面的網頁，都必須要遵守此指引。 |
| 檢測說明 | 1. 用chrome打開檔案，會自動換行，此原因為程式碼內有此行程式(此行程式碼只限英文字母上可使用):<br>   <br>   <br>    <table style="word-break:break-all">，可執行自動換行的指令，若去掉此行程式碼則沒有換行功能。<br>   <br>   ![檢視自動換行](https://accessibility.moda.gov.tw/ImagesUploads/551a5f93-6b53-4ece-aa0e-c0ee6878e9b4.jpg)<br>2. 若去掉這行程式碼，則無法自動換行，如此當視窗變窄時，即須拉動卷軸。<br>   <br>   ![移除原始碼則無法執行自動換行](https://accessibility.moda.gov.tw/ImagesUploads/2f0259ec-409a-4616-8815-e94e5dd697ba.jpg)<br>3. 檢視原始碼。<br>   <br>   ![檢視原始碼](https://accessibility.moda.gov.tw/ImagesUploads/a1083b3c-4bc3-45d4-a68c-ab4afa9901d9.jpg) |
| 說明 | 無 |

---

### 成功準則1.4.9：影像文字(無例外) (檢測等級AAA)

影像文字僅用於純裝飾，或者是文字以特定方式呈現對於資訊的傳達有其必要性。

#### 相關範例說明連結

##### [範例說明](https://accessibility.moda.gov.tw/Download/Detail/1613?Category=64) (另開新視窗)

**1.4.9 CS3140900E 只有在純裝飾或者是對於傳達資訊來說以此特定方式呈現文字是必要的情況下，使用CSS來將文字取代成影像文字，並提供使用者介面控制元件來加以切換**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS3140900E |
| 對應成功準則 | 1.4.9 |
| 對應認證等級 | AAA |
| 對應國際技術碼 | C30 |
| 類別 | CSS |
| 訊息 | 只有在純裝飾或者是對於傳達資訊來說以此特定方式呈現文字是必要的情況下，使用CSS來將文字取代成影像文字，並提供使用者介面控制元件來加以切換。 |
| 英文訊息 | C30: Using CSS to replace text with images of text and providing user interface controls to switch |
| 規則說明 | 所有網頁中若包含文字，所有文字必須遵守此指引。<br>無法準確判斷是否有影像文字 |
| 檢測說明 | 1. 原網頁文字<br>   <br>   ![原網頁文字](https://accessibility.moda.gov.tw/ImagesUploads/e783b0ea-e7d0-4911-a324-9e3718bd8b7b.jpg)<br>   <br>   <br>    【HTML】<br>   <br>   <br>    <div id="recipe"><br>   <br>   <br>       <h3>Marinara Sauce</h3><br>   <br>   <br>       <ul><br>   <br>   <br>         <li>2 lbs washed, seeded Roma tomatoes</li><br>   <br>   <br>         <li>2 cloves garlic</li><br>   <br>   <br>         <li>1 Tbsp olive oil</li><br>   <br>   <br>         <li>1 Tbsp sugar</li><br>   <br>   <br>         <li>1 Tbsp oregano</li><br>   <br>   <br>         <li>1 tsp salt</li><br>   <br>   <br>       </ul><br>   <br>   <br>    </div><br>2. 使用CSS呈現影像文字<br>   <br>   ![使用CSS呈現影像文字](https://accessibility.moda.gov.tw/ImagesUploads/efe09857-3f5d-4648-a03b-a0f7960ad86a.jpg)<br>   <br>   <br>    【CSS】<br>   <br>   <br>    #firHeader {<br>   <br>   <br>       width: 300px;<br>   <br>   <br>       height: 50px;<br>   <br>   <br>       background: #fff url(firHeader.gif) top left no-repeat;<br>   <br>   <br>    }<br>   <br>   <br>    #firHeader span {<br>   <br>   <br>       display: none;<br>   <br>   <br>    } |
| 說明 | 無 |

---

### 成功準則1.4.10：流動排版 (檢測等級AA)

內容可以在不失去資訊或功能性且無需進行二維捲動下呈現，如下列：

- 內容垂直捲動的寬度相當於320個CSS像素；
- 內容水平捲動的高度相當於256個CSS像素。

需要利用二維配置來提供部份內容使用或有意義呈現者除外。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1614?Category=64) (另開新視窗)

**1.4.10 CS2141000E 使用媒體查詢(media query)和CSS網格(grid)重排網頁欄格**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141000E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C32 |
| 類別 | CSS |
| 訊息 | 使用媒體查詢和CSS網格重排網頁欄格 |
| 英文訊息 | C32: Using media queries and grid CSS to reflow columns |
| 規則說明 | 創建在不同裝置上及使用者偏好不同內容大小而可良好呈現的設計，必須遵守此方式。 |
| 檢測說明 | 程序<br>1. 在能夠進行400％縮放的使用者代理中顯示網頁，並將視埠尺寸(以CSS像素為單位)設置為1280寬和1024高。<br>2. 放大400％。<br>3. 對於水平讀取的內容，檢查所有內容和功能是否可用而不進行水平滾動。<br>4. 對於垂直讀取的內容，檢查所有內容和功能是否可用而不進行垂直滾動。<br>注意：<br>如果瀏覽器無法縮放到400％，則可以按比例縮放瀏覽器的寬度或高度。例如，在300％縮放時，視埠的大小應為960px寬。<br>預期結果<br>檢查#3和#4為是。 |
| 說明 | 參考資源<br>- [CSS Grid Layout module level 1](https://www.w3.org/TR/css-grid-1/) \|(https://www.w3.org/TR/css-grid-1/)<br>- [MDN grid layout index](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) \|(https://developer.mozilla.org/en-US/docs/Web/CSS/CSS\_Grid\_Layout)<br>- Grid by example<br>相關技術<br>- C31: Using CSS Flexbox to reflow content |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1615?Category=64) (另開新視窗)

**1.4.10 CS2141001E 使用CSS彈性容器(flexbox)重排內容**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141001E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C31 |
| 類別 | CSS |
| 訊息 | 使用CSS彈性容器重排內容 |
| 英文訊息 | C31: Using CSS Flexbox to reflow content |
| 規則說明 | 使用Flexbox Layouts讓布局區塊可根據流動排版後的需要，在螢幕上顯示布局區塊。創建在不同裝置和使用者偏好的不同縮放而可良好呈現的設計，必須遵守此方式。 |
| 檢測說明 | 程序<br>1. 在能夠進行400％縮放的使用者代理中顯示網頁，並將視埠尺寸(以CSS像素為單位)設置為1280寬和1024高。<br>2. 放大400％。<br>3. 對於水平讀取的內容，檢查所有內容和功能是否可用而不進行水平滾動。<br>4. 對於垂直讀取的內容，檢查所有內容和功能是否可用而不進行垂直滾動。<br>注意：<br>如果瀏覽器無法縮放到400％，則可以按比例縮小瀏覽器的寬度。例如，在300％縮放時，視埠的大小應為960px寬。<br>預期結果<br>#3和#4為是。 |
| 說明 | 參考資源<br>- [CSS Flexible Box Layout Module Level 1](https://www.w3.org/TR/css-flexbox-1/) \|(https://www.w3.org/TR/css-flexbox-1/)<br>- [MDN Flexible Box Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout) \|(https://developer.mozilla.org/en-US/docs/Web/CSS/CSS\_Flexible\_Box\_Layout)<br>- [CSS Tricks Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) \|(https://css-tricks.com/snippets/css/a-guide-to-flexbox/)<br>相關技術<br>- C32: Using media queries and grid CSS to reflow columns |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1616?Category=64) (另開新視窗)

**1.4.10 CS2141002E 針對長網址跟文字字符串可以進行重排**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141002E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C33 |
| 類別 | CSS |
| 訊息 | 針對長網址跟文字字符串可以進行重排 |
| 英文訊息 | C33: Allowing for Reflow with Long URLs and Strings of Text |
| 規則說明 | 讓沒有空格的長字符集(如URL)在頁面縮放時不會破壞重排，必須遵守此方式。 |
| 檢測說明 | 程序<br>對於寬度超過320px的文字字符串，檢查：<br>1. 在能夠進行400％縮放的使用者代理中顯示網頁，並將視埠尺寸(以CSS像素為單位)設置為1280寬和1024高。<br>2. 放大400％。<br>3. 對於水平讀取的內容，檢查所有內容和功能是否可用而不進行水平滾動。<br>4. 對於垂直讀取的內容，檢查所有內容和功能是否可用而不進行垂直滾動。<br>注意：<br>如果瀏覽器無法縮放到400％，則可以按比例縮小瀏覽器的寬度。例如，在300％縮放時，視埠的大小應為960px寬。<br>預期結果<br>#3和#4為是。 |
| 說明 | 無 |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1617?Category=64) (另開新視窗)

**1.4.10 CS2141003E 使用CSS寬度、最大寬度和彈性容器(flexbox)屬性調適標籤和輸入**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141003E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C38 |
| 類別 | CSS |
| 訊息 | 使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入 |
| 英文訊息 | C38: Using CSS width, max-width and flexbox to fit labels and inputs |
| 規則說明 | 因螢幕空間限制，標籤與輸入框水平並列，將改變為垂直對齊，必須遵守此方式。<br>調適標籤和輸入的基本方法：<br>1. 使用flexbox屬性和特定視埠大小的媒體查詢(media query)定義佈局區域的大小，以便它們在可用空間中放大、縮小或換行並響應縮放級別；<br>2. 將佈局區域放置在flexbox容器中作為一行相鄰的flexbox項目，這些項目可以根據需要換行，其方式與段落換行中的單詞大致相同。<br>3. 定義標籤和輸入的width和max-width屬性，以便它們在可用空間中放大或縮小並響應縮放級別。 |
| 檢測說明 | 程序<br>1. 在能夠進行400％縮放的使用者代理中顯示網頁，並將視埠尺寸(以CSS像素為單位)設置為1280寬和1024高。<br>2. 放大400％。<br>3. 對於垂直滾動內容，所有標籤和輸入都適合其可用空間而無需水平滾動。<br>注意：<br>如果瀏覽器無法縮放到400％，您可以按比例縮小瀏覽器的寬度。例如，在300％縮放時，視埠的大小應為960px寬。<br>預期結果<br>檢查#3為是。 |
| 說明 | 無 |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1618?Category=64) (另開新視窗)

**1.4.10 SC2141004E 使用與文字大小成比例的方式計算大小和位置**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | SC2141004E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | SCR34 |
| 類別 | Client-Side Scripting |
| 訊息 | 使用與文字大小成比例的方式計算大小和位置 |
| 英文訊息 | SCR34: Calculating size and position in a way that scales with text size |
| 規則說明 | 必須遵守以縮放文字大小的方式來計算元素的大小和位置。<br>使用JavaScript中的四個屬性可幫助確定元素的大小和位置：<br>- offsetHeight(元素的高度，以像素為單位)<br>- offsetWidth(元素的寬度，以像素為單位)<br>- offsetLeft(元素到其父元素(offsetParent)左側的距離，以像素為單位)<br>- offsetTop(元素到其父元素(offsetParent)的頂部的距離，以像素為單位) |
| 檢測說明 | 程序<br>1. 打開一個隨著文字大小的改變而調整容器大小的頁面。<br>2. 使用瀏覽器的文字大小調整功能(不使用縮放功能)將文字大小放大至200％。<br>3. 檢查文字，以確保調整文字容器的大小可適應文字的大小。<br>4. 確保沒有因文字大小的增加而導致文字被"裁切"或消失。<br>預期結果<br>檢查#3和#4為是。 |
| 說明 | 參考資源<br>- [MSDN: Fix the Box Instead of Thinking Outside It](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/?redirectedfrom=MSDN#cssenhancements_topic3) \|(https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/?redirectedfrom=MSDN#cssenhancements_topic3)<br>相關技術<br>- C12: Using percent for font sizes<br>- C14: Using em units for font sizes<br>- C17: Scaling form elements which contain text<br>- C20: Using relative measurements to set column widths so that lines can average 80 characters or less when the browser is resized<br>- C24: Using percentage values in CSS for container sizes<br>- G206: Providing options within the content to switch to a layout that does not require the user to scroll horizontally to read a line of text |

---

##### [範例說明6](https://accessibility.moda.gov.tw/Download/Detail/1619?Category=64) (另開新視窗)

**1.4.10 GN2141005E 在內容內提供選項以切換到不需要使用者水平滾動以閱讀文字行的佈局**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2141005E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G206 |
| 類別 | General |
| 訊息 | 在內容內提供選項以切換到不需要用戶水平滾動以閱讀文字行的佈局 |
| 英文訊息 | G206: Providing options within the content to switch to a layout that does not require the user to scroll horizontally to read a line of text |
| 規則說明 | 網頁呈現內容若需使用水平滾動的佈局，可以在內容內提供選項，切換到不需要使用者水平滾動以閱讀文字行的佈局。 |
| 檢測說明 | 程序<br>1. 在全螢幕視窗上打開需要水平滾動的內容。<br>2. 檢查內容中是否有選項可以切換到不需要使用者水平滾動以讀取一行文字的佈局。<br>3. 啟動該選項。<br>4. 檢查確保不需要水平滾動即可讀取任何一行文字。<br>預期結果<br>檢查#2和#4為是。 |
| 說明 | 相關技術<br>- C20: Using relative measurements to set column widths so that lines can average 80 characters or less when the browser is resized |

---

##### [範例說明7](https://accessibility.moda.gov.tw/Download/Detail/1620?Category=64) (另開新視窗)

**1.4.10 CS2141006E 使用媒體查詢(media query)來解除粘滯的頁首/頁尾**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141006E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C34 |
| 類別 | CSS |
| 訊息 | 使用媒體查詢來解除粘滯的頁首/頁尾 |
| 英文訊息 | C34: Using media queries to un-fixing sticky headers/footers |
| 規則說明 | 在橫向使用裝置或桌面放大時，解除粘滯頁首和頁尾的內容，以可獲得更大的可見視圖。<br>解開粘滯頁首/頁尾的基本方法：<br>1. 使用媒體查詢min-height屬性定義第一個粘滯區域，以便根據可用空間固定或取消固定；<br>2. 使用特定視埠大小的媒體查詢min-width和max-height屬性定義其他粘滯區域，以便根據可用空間將其固定或取消固定，例如：對於平板電腦，取決於裝置的直向或橫向位置。 |
| 檢測說明 | 程序<br>注意：此測試依據測試的環境，可能有不同的實際模式或大小。<br>- 1.以直向模式在裝置/使用者代理上顯示內容。<br>- 2.將方向更改為橫向。<br>- 3.檢查粘滯的頁首和頁尾是否依據既有的媒體查詢設定而取消固定。<br>- 4.在以1280x1024 CSS像素的起始視埠寬度的桌面/使用者代理上顯示內容。<br>- 5.更改寬度和高度的視埠大小或使用瀏覽器的縮放功能。<br>- 6.檢查粘滯的頁首和頁尾是否依據既有的媒體查詢設定而以特定尺寸取消固定。<br>預期結果<br>#3和#6為是。 |
| 說明 | 無 |

---

##### [範例說明8](https://accessibility.moda.gov.tw/Download/Detail/1621?Category=64) (另開新視窗)

**1.4.10 CS2141007E 使用CSS最大寬度和高度容納圖像**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141007E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C37 |
| 類別 | CSS |
| 訊息 | 使用CSS最大寬度和高度容納圖像 |
| 英文訊息 | C37: Using CSS max-width and height to fit images |
| 規則說明 | 響應式佈局的圖片須能適應可用的空間與保留圖片的原始尺寸，必須遵守使用CSS max-width和height屬性的方式。 |
| 檢測說明 | 程序<br>1. 在能夠進行400％縮放的使用者代理中顯示網頁，並將視埠尺寸(以CSS像素為單位)設置為1280寬和1024高。<br>2. 放大400％。<br>3. 對於水平讀取的內容，檢查所有圖片是否適合其可用空間而不進行水平滾動。<br>4. 對於垂直讀取的內容，請檢查所有圖片是否適合其可用空間而不進行垂直滾動。<br>注意：<br>如果瀏覽器無法縮放到400％，則可以按比例縮小瀏覽器的寬度。例如，在300％縮放時，視埠的大小應為960px寬。<br>預期結果<br>#3和#4為是。 |
| 說明 | 無 |

---

##### [範例說明9](https://accessibility.moda.gov.tw/Download/Detail/1622?Category=64) (另開新視窗)

**1.4.10 FA2141008E 由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2141008E |
| 對應成功準則 | 1.4.10 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F102 |
| 類別 | Failure |
| 訊息 | 由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗 |
| 英文訊息 | F102: Failure of Success Criterion 1.4.10 due to content disappearing and not being available when content has reflowed |
| 規則說明 | 當視埠寬度更改為320px導致視埠寬度更寬時可用的內容消失。 |
| 檢測說明 | 程序<br>1. 檢查電腦視埠寬度(例如1280px)上的可見內容元素。<br>2. 縮小或放大瀏覽器視窗以將視窗寬度設置為320px，以使視窗寬度現在為320px(當以1280px視窗寬度開始由100％瀏覽器縮放時，可透過放大至400％完成本項程序)。<br>3. 對於視窗寬度為320px時未提供的每個內容元素，請檢查是否有一種方法可以透過小部件，彈出視窗或指向其他視圖的鏈結來獲得相同或等效的內容。<br>預期結果<br>如果#3為否，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 無 |

---

### 成功準則1.4.11：非文字對比 (檢測等級AA)

下列內容的視覺呈現與相鄰顏色的對比度至少為3:1：

- 使用者介面元件：使用者介面元件和狀態識別所需的視覺資訊，除非是閒置元件或元件外觀由使用者代理確定且未經由網頁作者修改的情況；
- 圖形物件：理解內容所需要的圖形部分，除非是圖形的特定呈現對於資訊傳達為必要。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1623?Category=64) (另開新視窗)

**1.4.11 GN2141100E 使用網頁作者設定的高可視焦點指示器**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2141100E |
| 對應成功準則 | 1.4.11 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G195 |
| 類別 | General |
| 訊息 | 使用網頁作者設定的高可視焦點指示器 |
| 英文訊息 | G195: Using an author-supplied, highly visible focus indicator |
| 規則說明 | 當使用者使用滑鼠、Tab鍵、箭頭方向鍵、鍵盤快捷鍵或任何其他方法將焦點放在某個元素上時，該應用程序會使用高度對比的顏色，或較粗的顏色，以及其他視覺指示器(例如發光)，使焦點更加清晰可見。 |
| 檢測說明 | 程序<br>1. 使用鍵盤將焦點放在頁面中的每個可聚焦的使用者介面元素上。<br>2. 檢查是否有清晰可見的焦點指示器。<br>3. 檢查焦點指示器的區域至少有1 CSS像素圍繞該元素。<br>4. 檢查指示器在聚焦與未聚焦狀態之間對比度的改變，指示器的區域是否具有3:1對比值。<br>5. 如果焦點指示器與相鄰的顏色未達3:1對比值，檢查指示器邊線厚度是否有2 CSS像素。<br>預期結果<br>檢查#2、#4、#5為是。 |
| 說明 | 相關技術<br>- G149: Using user interface components that are highlighted by the user agent when they receive focus<br>- G165: Using the default focus indicator for the platform so that high visibility default focus indicators will carry over<br>- C15: Using CSS to change the presentation of a user interface component when it receives focus<br>- SCR31: Using script to change the background color or border of the element with focus |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1624?Category=64) (另開新視窗)

**1.4.11 GN2141101E 確保圖示的對比度為3：1**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2141101E |
| 對應成功準則 | 1.4.11 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G207 |
| 類別 | General |
| 訊息 | 確保圖示的對比度為3：1 |
| 英文訊息 | G207: Ensuring that a contrast ratio of 3:1 is provided for icons |
| 規則說明 | 用來理解內容的圖形物件，需要與該圖形相鄰的顏色具有至少3：1的對比度。 |
| 檢測說明 | 程序<br>對於理解所需的圖形物件，使用顏色對比工具：<br>1. 確定圖形物件的前景色。<br>2. 確定相鄰的背景顏色。如果背景顏色是漸層或圖案，確認與前景色對比度最小的顏色。<br>3. 檢查對比度是否等於或大於3：1。<br>4. 如果背景區域的一部分與前景未達3：1，則假設與該區域相鄰的圖示部分為不可見。<br>5. 檢查該圖示缺少了任何對比度不足的區域，是否仍可識別。<br>預期結果<br>#3和#5為是。 |
| 說明 | 參考資源<br>- "了解SC 1.4.3對比度(最小值)"(Understanding SC 1.4.3 Contrast (minimum)) (https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html#resources)中列舉了測試對比度的一系列工具和應用程序。<br>相關技術<br>- G18: Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text<br>- G145: Ensuring that a contrast ratio of at least 3:1 exists between text (and images of text) and background behind the text |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1625?Category=64) (另開新視窗)

**1.4.11 GN2141102E 在相鄰顏色之間的邊界處提供足夠的對比度**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2141102E |
| 對應成功準則 | 1.4.11 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G209 |
| 類別 | General |
| 訊息 | 在相鄰顏色之間的邊界處提供足夠的對比度 |
| 英文訊息 | G209: Provide sufficient contrast at the boundaries between adjoining colors |
| 規則說明 | 確保能夠區分相鄰顏色之間的邊界。<br>如果相鄰顏色的色彩對比度差小於3：1，則為每種顏色添加至少3：1顏色對比度的邊框。 |
| 檢測說明 | 程序<br>對於理解所需的圖形物件，使用顏色對比工具：<br>1. 測量每種顏色與相鄰顏色或邊界(如果存在)的對比度。<br>2. 檢查每個相鄰顏色或邊框(如果有)的對比度至少為3:1。<br>預期結果<br>#2為是。 |
| 說明 | 參考資源<br>- "了解SC 1.4.3對比度(最小值)"(Understanding SC 1.4.3 Contrast (minimum)) (https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html#resources)中列舉了測試對比度的一系列工具和應用程序。<br>相關技術<br>- G207: Ensuring that a contrast ratio of 3:1 is provided for icons |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1626?Category=64) (另開新視窗)

**1.4.11 GN2141103E 提供具有足夠對比度的控制元件，以允許使用者切換到足夠對比度的呈現**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | GN2141103E |
| 對應成功準則 | 1.4.11 |
| 對應認證等級 | AA |
| 對應國際技術碼 | G174 |
| 類別 | General |
| 訊息 | 提供具有足夠對比度的控制元件，以允許用戶切換到足夠對比度的呈現 |
| 英文訊息 | G174: Providing a control with a sufficient contrast ratio that allows users to switch to a presentation that uses sufficient contrast |
| 規則說明 | 提供頁面上的鏈結或控制元件可以更改頁面以使所有方面都符合要求，或者可以提供使用者轉到確實符合所需級別的頁面。 |
| 檢測說明 | 程序<br>1. 檢查原始頁面上是否存在可訪問備用版本的鏈結或控制元件。<br>2. 檢查原始頁面上的鏈結或控制元件是否符合所測試一致性級別的所有成功條件。<br>3. 檢查替代版本是否符合對比度和所有其他成功準則，以符合所測試的一致性級別。<br>預期結果<br>#1、#2、#3為是。 |
| 說明 | - G17: Ensuring that a contrast ratio of at least 7:1 exists between text (and images of text) and background behind the text<br>- G18: Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text<br>- G145: Ensuring that a contrast ratio of at least 3:1 exists between text (and images of text) and background behind the text<br>- G148: Not specifying background color, not specifying text color, and not using technology featrues that change those defaults |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1627?Category=64) (另開新視窗)

**1.4.11 FA2141104E 由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2141104E |
| 對應成功準則 | 1.4.11 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F78 |
| 類別 | Failure |
| 訊息 | 由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗 |
| 英文訊息 | F78: Failure of Success Criterion 2.4.7 due to styling element outlines and borders in a way that removes or renders non-visible the visual focus indicator |
| 規則說明 | 使用者代理的預設鍵盤焦點視覺指示器被關閉或被頁面上的其他樣式顯示為不可見而未能出現網頁作者提供的視覺焦點指示器。 |
| 檢測說明 | 程序<br>1. 使用鍵盤將焦點設置在頁面上所有可聚焦的元素。<br>2. 檢查焦點指示器是否可見。<br>預期結果<br>#2為否，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 無 |

---

### 成功準則1.4.12：文字間距 (檢測等級AA)

使用支援以下文字樣式屬性的標記語言實現的內容中，透過設置以下所有內容且在不更改其他樣式屬性下，不會喪失任何內容或功能性：

- 行高至少為字體大小的1.5倍；
- 段落間距至少是字體大小的2倍；
- 字元間距至少為字體大小的0.12倍；中文字元0.14倍。
- 字間距至少為字體大小的0.16倍。

**例外**：在書面文字中並未使用一個或多個這些文字樣式屬性的人類語言和腳本，可以使用專門對應該語言和腳本組合的屬性值。

**註**：中文內容的文字間距可以採用上述的行高和段落間距要求，字距則可參照一般中文出版業的要求。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1628?Category=64) (另開新視窗)

**1.4.12 CS2141200E 允許使用者按照其偏好覆蓋原有的網頁文字設定間距**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141200E |
| 對應成功準則 | 1.4.12 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C36 |
| 類別 | CSS |
| 訊息 | 允許使用者按照其偏好覆蓋原有的網頁文字設定間距 |
| 英文訊息 | C36: Allowing for text spacing override |
| 規則說明 | 文字容器必須具有文字擴展的空間或容器能夠擴展。 |
| 檢測說明 | 程序<br>對於包含換行文字的元素：<br>1. 將縮放級別設置為100％。<br>2. 使用工具或其他機制使用文字間距度量(行高、段落、字母和單詞間距)，例如Text Spacing Bookmarklet或用戶樣式的瀏覽器外掛程式。<br>3. 檢查所有內容和功能是否可用，例如，容器中的文字不會被截斷，也不會與其他內容重疊。<br>預期結果<br>#3為是。<br>注意：<br>如果頁面具有多個佈局(例如，在響應式設計中)，則應在每個佈局中測試文字間距。 |
| 說明 | 相關技術<br>C35: Allowing for text spacing without wrapping |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1629?Category=64) (另開新視窗)

**1.4.12 CS2141201E 允許調整文字間距而不換行(wrapping)**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141201E |
| 對應成功準則 | 1.4.12 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C35 |
| 類別 | CSS |
| 訊息 | 允許調整文字間距而不換行(wrapping) |
| 英文訊息 | C35: Allowing for text spacing without wrapping |
| 規則說明 | 文章內容需要允許間距更改而不會丟失內容或功能，方允許包含文字的元素根據需要進行擴展。 |
| 檢測說明 | 程序<br>對於包含不換行的文字元素：<br>1. 將縮放級別設置為100％。<br>2. 使用工具或其他機制運用文字間距度量(行高、段落、字母和單詞間距)，例如Text Spacing Bookmarklet或用戶樣式的瀏覽器插件。<br>3. 檢查所有內容和功能是否可用，例如，容器中的文字不會被截斷，也不會與其他內容重疊。<br>預期結果<br>#3為是。<br>注意<br>如果頁面具有多個佈局(例如，在響應式設計中)，則應在每個佈局中測試文字間距。 |
| 說明 | 相關技術<br>C36: Allowing for text spacing override |

---

##### [範例說明3](https://accessibility.moda.gov.tw/Download/Detail/1630?Category=64) (另開新視窗)

**1.4.12 CS2141202E 使用CSS (letter-spacing)屬性來控制單字內空格**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141202E |
| 對應成功準則 | 1.4.12 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C8 |
| 類別 | CSS |
| 訊息 | 使用CSS letter-spacing來控制單字內空格 |
| 英文訊息 | C8: Using CSS letter-spacing to control spacing within a word |
| 規則說明 | 透過樣式表來增強文字間距的視覺外觀，同時仍保持有意義的文字排序，而不要添加空白字符來控制間距。 |
| 檢測說明 | 程序<br>對於每個看起來字符之間具有非標準間距的單詞：<br>1. 檢查CSS字母間距屬性是否用於控制間距。<br>預期結果<br>檢查#1為是。 |
| 說明 | 參考資源<br>- CSS 2: Letter and word spacing(https://www.w3.org/TR/CSS2/text.html#spacing-props)<br>相關技術<br>- F1: Failure of Success Criterion 1.3.2 due to changing the meaning of content by positioning information with CSS<br>- F32: Failure of Success Criterion 1.3.2 due to using white space characters to control spacing within a word |

---

##### [範例說明4](https://accessibility.moda.gov.tw/Download/Detail/1631?Category=64) (另開新視窗)

**1.4.12 CS2141203E 以CSS設定行間距**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141203E |
| 對應成功準則 | 1.4.12 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C21 |
| 類別 | CSS |
| 訊息 | 以CSS設定行間距 |
| 英文訊息 | C21: Specifying line spacing in CSS |
| 規則說明 | 提供1.5到2之間的行間距，有利於閱讀完成前一行之後，更容易地開始新的一行。 |
| 檢測說明 | 程序<br>1. 在瀏覽器中打開內容。<br>2. 檢查文字塊中各行之間的間距是否在1.5到2之間。<br>預期結果<br>#2為是。 |
| 說明 | 無 |

---

##### [範例說明5](https://accessibility.moda.gov.tw/Download/Detail/1632?Category=64) (另開新視窗)

**1.4.12 CS2141204E 以em單位為單位設定文字容器的大小**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | CS2141204E |
| 對應成功準則 | 1.4.12 |
| 對應認證等級 | AA |
| 對應國際技術碼 | C28 |
| 類別 | CSS |
| 訊息 | 以em單位為單位設定文字容器的大小 |
| 英文訊息 | C28: Specifying the size of text containers using em units |
| 規則說明 | 設定文字容器尺寸，須遵守此方式。 |
| 檢測說明 | 程序<br>1. 確定包含文字或允許文字輸入的容器。<br>2. 檢查容器的寬度和/或高度是否以em為單位指定。<br>預期結果<br>檢查#2為是。 |
| 說明 | 相關技術<br>- C12: Using percent for font sizes<br>- C14: Using em units for font sizes<br>- C17: Scaling form elements which contain text<br>- C20: Using relative measurements to set column widths so that lines can average 80 characters or less when the browser is resized |

---

##### [範例說明6](https://accessibility.moda.gov.tw/Download/Detail/1633?Category=64) (另開新視窗)

**1.4.12 FA2141205E 由於調整文字間距時內容被剪切或重疊，而導致成功準則1.4.12失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2141205E |
| 對應成功準則 | 1.4.12 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F104 |
| 類別 | Failure |
| 訊息 | 由於調整文字間距時內容被剪切或重疊，而導致成功準則1.4.12失敗 |
| 英文訊息 | F104: Failure of Success Criterion 1.4.12 due to clipped or overlapped content when text spacing is adjusted |
| 規則說明 | 調整文字間距時，部分內容會被裁切並且不可讀，而導致失敗。 |
| 檢測說明 | 程序<br>1. 打開頁面並查看可用內容。<br>2. 以使用者樣式表設定此成功條件列出的值，來覆蓋頁面的CSS、書籤、擴展或應用程序的樣式。<br>   1. 行高至少為字體大小的1.5倍；<br>   2. 段落之間的間距至少為字體大小的2倍；<br>   3. 字母間距(跟踪)至少為字體大小的0.12倍；<br>   4. 字間距為字體大小的0.16倍。<br>3. 檢查是否由於新的文字間距而裁切，遮擋或失去任何內容。<br>預期結果<br>檢查#3為是，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 參考資源<br>- [Stylus Extension for Chrome](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=en) \|(https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=en)<br>- [Stylus Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/styl-us/) \|(https://addons.mozilla.org/en-US/firefox/addon/styl-us/)<br>相關技術<br>- F69: Failure of Success Criterion 1.4.4 when resizing visually rendered text up to 200 percent causes the text, image or controls to be clipped, truncated or obscured |

---

### 成功準則1.4.13：懸浮或焦點內容 (檢測等級AA)

附加懸浮內容因指標移動或鍵盤焦點觸發而可視後隱藏時，下列為真：

- 可移除：提供一種機制移除附加懸浮內容，不用移動指標或鍵盤焦點，除非是附加懸浮內容傳達輸入錯誤或未隱藏或替換其他內容；
- 可移動：如果指標移動可觸發附加懸浮內容，則指標可以在附加懸浮內容上移動而不會使該內容消失；
- 持續性：附加懸浮內容應維持可見，直到指標移出或鍵盤焦點移除、使用者解除或資訊不再有效。

**例外**：附加懸浮內容的視覺呈現應由使用者代理控制而非由網頁作者修改。

#### 相關範例說明連結

##### [範例說明1](https://accessibility.moda.gov.tw/Download/Detail/1634?Category=64) (另開新視窗)

**1.4.13 SC2141300E 使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | SC2141300E |
| 對應成功準則 | 1.4.13 |
| 對應認證等級 | AA |
| 對應國際技術碼 | SCR39 |
| 類別 | Client-Side Scripting |
| 訊息 | 使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續 |
| 英文訊息 | SCR39: Making content on focus or hover hoverable, dismissible, and persistent |
| 規則說明 | 將指標移至觸發器上方或將鍵盤焦點移至觸發器上時顯示的附加內容(例如，彈出視窗)必須保持可見，讓使用者有時間閱讀內容並與之互動，並且必須允許使用者將指標移到附加內容上，以及允許在不移動焦點的情況下刪除附加內容，以便使用者可以閱讀附加內容所覆蓋的內容。 |
| 檢測說明 | 程序<br>1. 打開頁面，使用指標是否觸發附加內容。<br>2. 檢查附加內容保持可見，並指標是否可移到附加內容上與刪除附加內容。<br>3. 鍵盤焦點是否觸發附加內容。<br>4. 檢查附加內容保持可見，並可刪除附加內容。<br>預期結果<br>檢查#2、#4為是。 |
| 說明 | 無 |

---

##### [範例說明2](https://accessibility.moda.gov.tw/Download/Detail/1635?Category=64) (另開新視窗)

**1.4.13 FA2141301E 由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗**

| 項目 | 內容 |
|------|------|
| 稽核評量碼 | FA2141301E |
| 對應成功準則 | 1.4.13 |
| 對應認證等級 | AA |
| 對應國際技術碼 | F95 |
| 類別 | Failure |
| 訊息 | 由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗 |
| 英文訊息 | F95: Failure of Success Criterion 1.4.13 due to content shown on hover not being hoverable |
| 規則說明 | 使用者很難或不可能將指標移動到彈出訊息時出現的附加內容上，則失敗。 |
| 檢測說明 | 程序<br>對於指標懸浮上顯示的附加內容區域：<br>1. 指標可以在新內容上移動而不會使附加內容消失。<br>預期結果<br>如果#1為否，則符合失敗條件，此內容未通過成功準則。 |
| 說明 | 無 |

---

## 附註

本文件共包含 **511 個連結**，其中：
- **內部錨點連結**：用於頁面內導航
- **外部連結（另開新視窗）**：指向範例說明文件，共 **237 個**

所有標示「另開新視窗」的連結在原網頁中都設定為 `target="_blank"`，會在新分頁中開啟。

---

**文件生成日期**：2025-11-01
**資料來源**：數位發展部無障礙網路空間服務網

