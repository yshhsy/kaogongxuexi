// 图形推理 —— 2022-2023年国考（行政执法卷/副省级卷）真题 SVG 重绘版
// 说明：本文件所有题干序列（q.figure）与选项（q.optionFigures）均以基础 SVG 图形忠实还原
//       真题的规律结构（对称性、一笔画、封闭区域数、线条数、元素遍历、位置移动/旋转等），
//       图形为依据真题解析描述重绘；纯图形题 options 为四个空字符串。
window.QUESTIONS_FIGURE_2223 = {
  materials: {},
  questions: [
    {
      id: "fig-2022xz-01",
      module: "判断推理",
      source: "2022年国考行政执法卷（图形重绘）",
      question: "从所给四个选项中，选择最合适的一个填入问号处，使之呈现一定的规律性：",
      options: ["", "", "", ""],
      answer: "B",
      analysis: "题干每幅图形均为轴对称图形，对称轴方向依次为：竖直→右上45°→水平→左上135°→竖直，对称轴每次顺时针旋转45°并循环。因此问号处图形的对称轴应为右上45°方向。A项对称轴为竖直方向，C项为水平方向，D项为左上135°方向，均不符合规律；B项等腰三角形的对称轴为右上45°方向，当选。故正确答案为B。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="32,30 17,64 47,64"/><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(95,50) rotate(45)"/><polygon points="0,-20 -15,14 15,14" transform="translate(158,50) rotate(90)"/><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(221,50) rotate(-45)"/><polygon points="284,30 269,64 299,64"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(45,42)"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-20 -15,14 15,14" transform="translate(45,42) rotate(45)"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(45,42) rotate(90)"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-20 -15,14 15,14" transform="translate(45,42) rotate(-45)"/></g></svg>'
      ]
    },
    {
      id: "fig-2022xz-02",
      module: "判断推理",
      source: "2022年国考行政执法卷（图形重绘）",
      question: "从四个备选图形中，选择最合适的一个填入问号处，使题干图形呈现统一的规律：",
      options: ["", "", "", ""],
      answer: "D",
      analysis: "题干图形的封闭区域数依次为1、2、3、4、5，构成公差为1的等差数列，故问号处图形的封闭区域数应为6。A项圆内4条直线将其分为5个封闭区域，B项为4个封闭区域，C项为7个封闭区域，均不符合规律；D项圆内5条竖线将圆分成6个封闭区域，当选。故正确答案为D。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="32" cy="50" r="20"/><circle cx="95" cy="50" r="20"/><line x1="95" y1="30" x2="95" y2="70"/><circle cx="158" cy="50" r="20"/><line x1="143" y1="36.8" x2="143" y2="63.2"/><line x1="173" y1="36.8" x2="173" y2="63.2"/><circle cx="221" cy="50" r="20"/><line x1="206" y1="36.8" x2="206" y2="63.2"/><line x1="216" y1="30.6" x2="216" y2="69.4"/><line x1="226" y1="30.6" x2="226" y2="69.4"/><line x1="236" y1="36.8" x2="236" y2="63.2"/><circle cx="284" cy="50" r="20"/><line x1="268" y1="38" x2="268" y2="62"/><line x1="276" y1="31.7" x2="276" y2="68.3"/><line x1="284" y1="30" x2="284" y2="70"/><line x1="292" y1="31.7" x2="292" y2="68.3"/><line x1="300" y1="38" x2="300" y2="62"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="45" cy="40" r="20"/><line x1="30" y1="26.8" x2="30" y2="53.2"/><line x1="40" y1="20.6" x2="40" y2="59.4"/><line x1="50" y1="20.6" x2="50" y2="59.4"/><line x1="60" y1="26.8" x2="60" y2="53.2"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="45" cy="40" r="20"/><line x1="33" y1="31.4" x2="33" y2="48.6"/><line x1="45" y1="20" x2="45" y2="60"/><line x1="57" y1="31.4" x2="57" y2="48.6"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="45" cy="40" r="20"/><line x1="29" y1="28" x2="29" y2="52"/><line x1="35.4" y1="30.9" x2="35.4" y2="49.1"/><line x1="41.8" y1="36.9" x2="41.8" y2="43.1"/><line x1="48.2" y1="36.9" x2="48.2" y2="43.1"/><line x1="54.6" y1="30.9" x2="54.6" y2="49.1"/><line x1="61" y1="28" x2="61" y2="52"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><circle cx="45" cy="40" r="20"/><line x1="29" y1="28" x2="29" y2="52"/><line x1="37" y1="31.7" x2="37" y2="48.3"/><line x1="45" y1="20" x2="45" y2="60"/><line x1="53" y1="31.7" x2="53" y2="48.3"/><line x1="61" y1="28" x2="61" y2="52"/></g></svg>'
      ]
    },
    {
      id: "fig-2022xz-03",
      module: "判断推理",
      source: "2022年国考行政执法卷（图形重绘）",
      question: "根据题干图形序列的变化，从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "A",
      analysis: "题干为相同的九宫格框架，黑色方块沿九宫格外圈按顺时针方向每次移动一格：左上→上中→右上→右中→右下，下一步应移动到下中位置。A项黑色方块位于下中，当选；B项位于左下，C项位于中心（不在外圈移动路径上），D项与第二步的位置重复，均不符合规律。故正确答案为A。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2"><rect x="14" y="32" width="36" height="36"/><line x1="26" y1="32" x2="26" y2="68"/><line x1="38" y1="32" x2="38" y2="68"/><line x1="14" y1="44" x2="50" y2="44"/><line x1="14" y1="56" x2="50" y2="56"/><rect x="15" y="33" width="10" height="10" fill="#333"/><rect x="77" y="32" width="36" height="36"/><line x1="89" y1="32" x2="89" y2="68"/><line x1="101" y1="32" x2="101" y2="68"/><line x1="77" y1="44" x2="113" y2="44"/><line x1="77" y1="56" x2="113" y2="56"/><rect x="90" y="33" width="10" height="10" fill="#333"/><rect x="140" y="32" width="36" height="36"/><line x1="152" y1="32" x2="152" y2="68"/><line x1="164" y1="32" x2="164" y2="68"/><line x1="140" y1="44" x2="176" y2="44"/><line x1="140" y1="56" x2="176" y2="56"/><rect x="165" y="33" width="10" height="10" fill="#333"/><rect x="203" y="32" width="36" height="36"/><line x1="215" y1="32" x2="215" y2="68"/><line x1="227" y1="32" x2="227" y2="68"/><line x1="203" y1="44" x2="239" y2="44"/><line x1="203" y1="56" x2="239" y2="56"/><rect x="228" y="45" width="10" height="10" fill="#333"/><rect x="266" y="32" width="36" height="36"/><line x1="278" y1="32" x2="278" y2="68"/><line x1="290" y1="32" x2="290" y2="68"/><line x1="266" y1="44" x2="302" y2="44"/><line x1="266" y1="56" x2="302" y2="56"/><rect x="291" y="57" width="10" height="10" fill="#333"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2"><rect x="24" y="19" width="42" height="42"/><line x1="38" y1="19" x2="38" y2="61"/><line x1="52" y1="19" x2="52" y2="61"/><line x1="24" y1="33" x2="66" y2="33"/><line x1="24" y1="47" x2="66" y2="47"/><rect x="39" y="48" width="12" height="12" fill="#333"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2"><rect x="24" y="19" width="42" height="42"/><line x1="38" y1="19" x2="38" y2="61"/><line x1="52" y1="19" x2="52" y2="61"/><line x1="24" y1="33" x2="66" y2="33"/><line x1="24" y1="47" x2="66" y2="47"/><rect x="25" y="48" width="12" height="12" fill="#333"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2"><rect x="24" y="19" width="42" height="42"/><line x1="38" y1="19" x2="38" y2="61"/><line x1="52" y1="19" x2="52" y2="61"/><line x1="24" y1="33" x2="66" y2="33"/><line x1="24" y1="47" x2="66" y2="47"/><rect x="39" y="34" width="12" height="12" fill="#333"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2"><rect x="24" y="19" width="42" height="42"/><line x1="38" y1="19" x2="38" y2="61"/><line x1="52" y1="19" x2="52" y2="61"/><line x1="24" y1="33" x2="66" y2="33"/><line x1="24" y1="47" x2="66" y2="47"/><rect x="39" y="25" width="12" height="12" fill="#333"/></g></svg>'
      ]
    },
    {
      id: "fig-2022xz-04",
      module: "判断推理",
      source: "2022年国考行政执法卷（图形重绘）",
      question: "结合题干图形之间的对应关系，从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "B",
      analysis: "题干图形两两一组：第一幅图（三角形、圆）与第二幅图（圆、正方形）叠加，去掉两者相同的部分（圆），保留不同的部分，得到第三幅图（三角形、正方形），即去同存异。同理，第四幅图（圆、十字）与第五幅图（十字、三角形）叠加，去掉相同的十字，保留不同的圆和三角形。A项为十字和三角形（相同部分），C项三个元素全保留，D项为圆和十字（与第四幅图相同），均不符合；B项为圆和三角形，当选。故正确答案为B。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="20,41 12,57 28,57"/><circle cx="44" cy="50" r="8"/><circle cx="83" cy="50" r="8"/><rect x="91" y="42" width="16" height="16"/><polygon points="146,41 138,57 154,57"/><rect x="162" y="42" width="16" height="16"/><circle cx="209" cy="50" r="8"/><line x1="233" y1="42" x2="233" y2="58"/><line x1="225" y1="50" x2="241" y2="50"/><line x1="272" y1="42" x2="272" y2="58"/><line x1="264" y1="50" x2="280" y2="50"/><polygon points="296,41 288,57 304,57"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="33" y1="32" x2="33" y2="48"/><line x1="25" y1="40" x2="41" y2="40"/><polygon points="57,31 49,47 65,47"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="33" cy="40" r="8"/><polygon points="57,31 49,47 65,47"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="40" r="7"/><line x1="45" y1="33" x2="45" y2="47"/><line x1="38" y1="40" x2="52" y2="40"/><polygon points="72,32 65,46 79,46"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="33" cy="40" r="8"/><line x1="57" y1="32" x2="57" y2="48"/><line x1="49" y1="40" x2="65" y2="40"/></g></svg>'
      ]
    },
    {
      id: "fig-2022fs-01",
      module: "判断推理",
      source: "2022年国考副省级卷（图形重绘）",
      question: "依据题干图形共同具备的特征，从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "C",
      analysis: "题干每幅图形的奇点数均为0或2（封闭图形无奇点，开放折线只有起点和终点两个奇点），均可由一笔画成。A项十字有4个奇点，B项田字有4个奇点（四边中点各为奇点），D项回字由内外两个互不相连的封闭图形构成，均不能一笔画成；C项W形折线只有两个奇点，可一笔画成，当选。故正确答案为C。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16,66 L32,34 L48,66"/><polygon points="95,32 79,64 111,64"/><polygon points="158,30 163,43.1 177,43.8 166.1,52.6 169.8,66.2 158,58.5 146.2,66.2 149.9,52.6 139,43.8 153,43.1"/><path d="M237,34 L205,34 L205,66 L237,66"/><path d="M268,36 L300,36 L268,64 L300,64"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="29" y1="40" x2="61" y2="40"/><line x1="45" y1="24" x2="45" y2="56"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="29" y="24" width="32" height="32"/><line x1="45" y1="24" x2="45" y2="56"/><line x1="29" y1="40" x2="61" y2="40"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M29,24 L37,56 L45,32 L53,56 L61,24"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="29" y="24" width="32" height="32"/><rect x="37" y="32" width="16" height="16"/></g></svg>'
      ]
    },
    {
      id: "fig-2022fs-02",
      module: "判断推理",
      source: "2022年国考副省级卷（图形重绘）",
      question: "分析题干图形的性质，从四个选项中选择最合适的一个填入问号处，延续原有规律：",
      options: ["", "", "", ""],
      answer: "B",
      analysis: "题干图形均为中心对称图形：Z形、平行四边形、N形、椭圆、沙漏形，绕中心旋转180°后均能与原图形重合。A项等腰三角形、C项等腰梯形均为轴对称图形而非中心对称，D项五角星为轴对称图形（有5条对称轴）而非中心对称，均不符合；B项H形绕中心旋转180°后与原图形重合，为中心对称图形，当选。故正确答案为B。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16,36 L48,36 L16,64 L48,64"/><polygon points="85,38 109,38 105,62 81,62"/><path d="M144,36 L144,64 L172,36 L172,64"/><ellipse cx="221" cy="50" rx="18" ry="10"/><polygon points="274,32 294,32 274,68 294,68"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="45,22 29,54 61,54"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="33" y1="24" x2="33" y2="60"/><line x1="57" y1="24" x2="57" y2="60"/><line x1="33" y1="42" x2="57" y2="42"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="27,58 63,58 55,26 35,26"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="45,22 50,35.1 64,35.8 53.1,44.6 56.8,58.2 45,50.5 33.2,58.2 36.9,44.6 26,35.8 40,35.1"/></g></svg>'
      ]
    },
    {
      id: "fig-2022fs-03",
      module: "判断推理",
      source: "2022年国考副省级卷（图形重绘）",
      question: "题干图形按次序排列并呈现规律，请从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "C",
      analysis: "题干图形均由直线构成，直线（边）的数量依次为3、4、5、6、7，构成公差为1的等差数列，故问号处图形应包含8条直线。A项六边形为6条直线，B项七边形为7条直线，D项九边形为9条直线，均不符合规律；C项八边形由8条直线构成，当选。故正确答案为C。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><polygon points="32,30 49.3,60 14.7,60"/><polygon points="95,30 115,50 95,70 75,50"/><polygon points="158,30 177,43.8 169.8,66.2 146.2,66.2 139,43.8"/><polygon points="221,30 238.3,40 238.3,60 221,70 203.7,60 203.7,40"/><polygon points="284,30 299.6,37.5 303.5,54.4 292.7,68 275.3,68 264.5,54.4 268.4,37.5"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><polygon points="45,22 62.3,32 62.3,52 45,62 27.7,52 27.7,32"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><polygon points="45,22 60.6,29.5 64.5,46.4 53.7,60 36.3,60 25.5,46.4 29.4,29.5"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><polygon points="45,22 59.1,27.9 65,42 59.1,56.1 45,62 30.9,56.1 25,42 30.9,27.9"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><polygon points="45,22 57.9,26.7 64.7,38.5 62.3,52 51.8,60.8 38.2,60.8 27.7,52 25.3,38.5 32.1,26.7"/></g></svg>'
      ]
    },
    {
      id: "fig-2023fs-01",
      module: "判断推理",
      source: "2023年国考副省级卷（图形重绘）",
      question: "题干图形按同一规律依次变化，请从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "A",
      analysis: "题干为同一个带箭头图形，依次逆时针旋转90°：箭头方向为：向上→向左→向下→向右→向上，构成周期循环，故问号处箭头应再次逆时针旋转90°，即指向左方。B项指向右方，C项指向下方，D项指向上方，均不符合；A项箭头指向左方，当选。故正确答案为A。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(32,50)"/><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(95,50) rotate(-90)"/><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(158,50) rotate(180)"/><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(221,50) rotate(90)"/><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(284,50)"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(45,42) rotate(-90)"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(45,42) rotate(90)"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(45,42) rotate(180)"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="0,-22 9,-8 4,-8 4,20 -4,20 -4,-8 -9,-8" transform="translate(45,42)"/></g></svg>'
      ]
    },
    {
      id: "fig-2023fs-02",
      module: "判断推理",
      source: "2023年国考副省级卷（图形重绘）",
      question: "将题干图形序列补充完整：请从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "C",
      analysis: "题干每幅图形均由一条横线与若干条竖线相交构成，横线与竖线的交点数依次为2、3、4、5、6，构成公差为1的等差数列，故问号处图形的交点数应为7。A项交点数为6，B项为5，D项为8，均不符合规律；C项横线与7条竖线相交，交点数为7，当选。故正确答案为C。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><line x1="8" y1="50" x2="56" y2="50"/><line x1="24" y1="34" x2="24" y2="66"/><line x1="40" y1="34" x2="40" y2="66"/><line x1="71" y1="50" x2="119" y2="50"/><line x1="83" y1="34" x2="83" y2="66"/><line x1="95" y1="34" x2="95" y2="66"/><line x1="107" y1="34" x2="107" y2="66"/><line x1="134" y1="50" x2="182" y2="50"/><line x1="143.6" y1="34" x2="143.6" y2="66"/><line x1="153.2" y1="34" x2="153.2" y2="66"/><line x1="162.8" y1="34" x2="162.8" y2="66"/><line x1="172.4" y1="34" x2="172.4" y2="66"/><line x1="197" y1="50" x2="245" y2="50"/><line x1="205" y1="34" x2="205" y2="66"/><line x1="213" y1="34" x2="213" y2="66"/><line x1="221" y1="34" x2="221" y2="66"/><line x1="229" y1="34" x2="229" y2="66"/><line x1="237" y1="34" x2="237" y2="66"/><line x1="260" y1="50" x2="308" y2="50"/><line x1="266.9" y1="34" x2="266.9" y2="66"/><line x1="273.7" y1="34" x2="273.7" y2="66"/><line x1="280.6" y1="34" x2="280.6" y2="66"/><line x1="287.4" y1="34" x2="287.4" y2="66"/><line x1="294.3" y1="34" x2="294.3" y2="66"/><line x1="301.1" y1="34" x2="301.1" y2="66"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><line x1="21" y1="40" x2="69" y2="40"/><line x1="27.9" y1="24" x2="27.9" y2="56"/><line x1="34.7" y1="24" x2="34.7" y2="56"/><line x1="41.6" y1="24" x2="41.6" y2="56"/><line x1="48.4" y1="24" x2="48.4" y2="56"/><line x1="55.3" y1="24" x2="55.3" y2="56"/><line x1="62.1" y1="24" x2="62.1" y2="56"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><line x1="21" y1="40" x2="69" y2="40"/><line x1="29" y1="24" x2="29" y2="56"/><line x1="37" y1="24" x2="37" y2="56"/><line x1="45" y1="24" x2="45" y2="56"/><line x1="53" y1="24" x2="53" y2="56"/><line x1="61" y1="24" x2="61" y2="56"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><line x1="21" y1="40" x2="69" y2="40"/><line x1="27" y1="24" x2="27" y2="56"/><line x1="33" y1="24" x2="33" y2="56"/><line x1="39" y1="24" x2="39" y2="56"/><line x1="45" y1="24" x2="45" y2="56"/><line x1="51" y1="24" x2="51" y2="56"/><line x1="57" y1="24" x2="57" y2="56"/><line x1="63" y1="24" x2="63" y2="56"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><line x1="21" y1="40" x2="69" y2="40"/><line x1="26.3" y1="24" x2="26.3" y2="56"/><line x1="31.7" y1="24" x2="31.7" y2="56"/><line x1="37" y1="24" x2="37" y2="56"/><line x1="42.3" y1="24" x2="42.3" y2="56"/><line x1="47.7" y1="24" x2="47.7" y2="56"/><line x1="53" y1="24" x2="53" y2="56"/><line x1="58.3" y1="24" x2="58.3" y2="56"/><line x1="63.7" y1="24" x2="63.7" y2="56"/></g></svg>'
      ]
    },
    {
      id: "fig-2023fs-03",
      module: "判断推理",
      source: "2023年国考副省级卷（图形重绘）",
      question: "为使整个序列规律一致，请从四个选项中选择最合适的一个填入问号处：",
      options: ["", "", "", ""],
      answer: "A",
      analysis: "题干每幅图形均由一个圆、一个正方形和一个三角形共三种元素构成，各元素数量均为一个，仅大小和摆放位置不同，即元素构成完全相同。B项缺少正方形（含两个三角形），C项缺少三角形（含两个正方形），D项缺少正方形（含两个圆），均不符合规律；A项包含圆、正方形、三角形各一个，当选。故正确答案为A。（图形依据真题解析描述重绘）",
      figure: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 100" width="380" height="100"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><circle cx="20" cy="38" r="7"/><polygon points="44,32 37,46 51,46"/><rect x="25.5" y="53.5" width="13" height="13"/><polygon points="83,30 76,44 90,44"/><rect x="76.5" y="51.5" width="13" height="13"/><circle cx="107" cy="56" r="7"/><polygon points="158,28 151,42 165,42"/><circle cx="146" cy="60" r="7"/><rect x="163.5" y="53.5" width="13" height="13"/><rect x="202.5" y="31.5" width="13" height="13"/><circle cx="221" cy="60" r="7"/><polygon points="233,30 226,44 240,44"/><circle cx="284" cy="36" r="7"/><polygon points="272,48 265,62 279,62"/><rect x="289.5" y="49.5" width="13" height="13"/></g><text x="347" y="62" text-anchor="middle" font-size="32" font-family="sans-serif" fill="#333">?</text></svg>',
      optionFigures: [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><circle cx="28" cy="26" r="7"/><rect x="55.5" y="19.5" width="13" height="13"/><polygon points="45,48 38,62 52,62"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><circle cx="28" cy="26" r="7"/><polygon points="62,18 55,32 69,32"/><polygon points="45,48 38,62 52,62"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><circle cx="28" cy="26" r="7"/><rect x="55.5" y="19.5" width="13" height="13"/><rect x="38.5" y="49.5" width="13" height="13"/></g></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" width="90" height="80"><g fill="none" stroke="#333" stroke-width="2" stroke-linejoin="round"><circle cx="28" cy="26" r="7"/><circle cx="62" cy="26" r="7"/><polygon points="45,48 38,62 52,62"/></g></svg>'
      ]
    }
  ]
};
