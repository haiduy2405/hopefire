#!/usr/bin/env python3
"""Append new UI strings to keys.json + every tr/<code>.txt, then rebuild. Usage: python3 tools/i18n/add_keys.py   (idempotent: skips keys already present)
Add a dict entry below: english -> {code: text}. {n} placeholders must match the English key (digit runs are {0},{1}...)."""
import json,subprocess
L=['vi','zh','es','pt','ru','de','ja']
NEW={
"Manual Cannon":dict(vi="Pháo tay lái",zh="手动主炮",es="Cañón manual",pt="Canhão manual",ru="Ручная пушка",de="Manuelle Kanone",ja="手動キャノン"),
"Hold fire & aim the main cannon yourself (mouse / right stick). It pierces everything in line":dict(vi="Giữ để bắn và tự ngắm pháo chính (chuột / cần analog phải). Xuyên mọi thứ trên đường bắn",zh="按住开火并自行瞄准主炮(鼠标/右摇杆)。可贯穿路径上的一切",es="Mantén para disparar y apunta tú mismo el cañón principal (ratón / stick derecho). Atraviesa todo lo que esté en línea",pt="Segure para disparar e mire o canhão principal você mesmo (mouse / analógico direito). Atravessa tudo em linha",ru="Удерживайте, чтобы стрелять и целиться из главной пушки самому (мышь / правый стик). Пробивает всё на линии",de="Halten zum Feuern und Zielen mit der Hauptkanone (Maus / rechter Stick). Durchschlägt alles in der Linie",ja="押し続けて発射し、メインキャノンを自分で狙う(マウス/右スティック)。直線上の全てを貫通"),
"Charges up, then a shockwave sweeps the whole screen and burns everything":dict(vi="Tích năng lượng rồi một làn sóng xung kích quét cả màn hình, thiêu mọi thứ",zh="蓄能后,冲击波扫过整个屏幕,灼烧一切",es="Se carga y luego una onda expansiva barre toda la pantalla y lo quema todo",pt="Carrega e então uma onda de choque varre a tela inteira, queimando tudo",ru="Заряжается, затем ударная волна проносится по всему экрану и сжигает всё",de="Lädt sich auf, dann fegt eine Schockwelle über den ganzen Bildschirm und verbrennt alles",ja="チャージ後、衝撃波が画面全体を薙ぎ払いすべてを焼き尽くす"),
"A freezing wave locks down every creature on screen. Frozen creatures take +{0}% damage":dict(vi="Làn sóng băng giá đóng băng mọi sinh vật trên màn hình. Sinh vật bị đóng băng chịu thêm +{0}% sát thương",zh="寒冰冲击波冻结屏幕上所有生物。被冻结的生物受到的伤害+{0}%",es="Una ola helada inmoviliza a todas las criaturas de la pantalla. Las congeladas reciben +{0}% de daño",pt="Uma onda gélida imobiliza todas as criaturas na tela. As congeladas sofrem +{0}% de dano",ru="Ледяная волна замораживает всех существ на экране. Замороженные получают +{0}% урона",de="Eine Frostwelle legt alle Kreaturen auf dem Bildschirm lahm. Gefrorene erleiden +{0}% Schaden",ja="凍結の波が画面上の全クリーチャーを拘束。凍結中は被ダメージ+{0}%"),
"Modules fire {0}× faster for ~{1}s and the ship arcs lightning into the horde":dict(vi="Module bắn nhanh gấp {0} lần trong ~{1}s và tàu phóng sét vào bầy quái",zh="模块射速×{0},持续约{1}秒,飞船还会向兽群释放闪电",es="Los módulos disparan {0}× más rápido durante ~{1}s y la nave lanza rayos a la horda",pt="Módulos disparam {0}× mais rápido por ~{1}s e a nave lança raios na horda",ru="Модули стреляют в {0}× быстрее ~{1}с, а корабль разряжает молнии в орду",de="Module feuern {0}× schneller für ~{1}s und das Schiff schleudert Blitze in die Horde",ja="~{1}秒間モジュールの発射速度{0}倍。さらに艦が群れへ稲妻を放つ"),
"Drags the horde into one point, then implodes":dict(vi="Hút cả bầy vào một điểm rồi nổ tung",zh="将兽群吸向一点,然后内爆",es="Arrastra a la horda a un punto y luego implosiona",pt="Arrasta a horda para um ponto e depois implode",ru="Стягивает орду в одну точку, затем схлопывается",de="Zieht die Horde in einen Punkt und implodiert dann",ja="群れを一点に引き寄せ、内側へ爆縮する"),
"Calls down a rain of meteors on the horde":dict(vi="Triệu hồi mưa thiên thạch giáng xuống bầy quái",zh="召唤流星雨砸向兽群",es="Invoca una lluvia de meteoros sobre la horda",pt="Invoca uma chuva de meteoros sobre a horda",ru="Обрушивает на орду метеоритный дождь",de="Lässt einen Meteoritenregen auf die Horde niedergehen",ja="群れに流星群を降らせる"),
"A lightning storm strikes again and again, chaining between creatures":dict(vi="Bão sét giáng liên tục, lan truyền giữa các sinh vật",zh="雷暴接连落下,并在生物之间连锁传导",es="Una tormenta eléctrica golpea una y otra vez, encadenándose entre criaturas",pt="Uma tempestade de raios cai repetidamente, encadeando entre as criaturas",ru="Грозовой шторм бьёт снова и снова, перескакивая между существами",de="Ein Gewitter schlägt immer wieder ein und springt zwischen Kreaturen über",ja="雷嵐が何度も落ち、クリーチャー間で連鎖する"),
"A giant laser sweeps a full circle around the ship":dict(vi="Tia laser khổng lồ quét một vòng tròn quanh tàu",zh="巨型激光绕飞船扫过一整圈",es="Un láser gigante barre un círculo completo alrededor de la nave",pt="Um laser gigante varre um círculo completo ao redor da nave",ru="Гигантский лазер описывает полный круг вокруг корабля",de="Ein riesiger Laser überstreicht einen vollen Kreis um das Schiff",ja="巨大レーザーが艦の周囲を一周薙ぎ払う"),
"OVERDRIVE READY":dict(vi="OVERDRIVE SẴN SÀNG",zh="超载就绪",es="SOBRECARGA LISTA",pt="SOBRECARGA PRONTA",ru="ФОРСАЖ ГОТОВ",de="OVERDRIVE BEREIT",ja="オーバードライブ準備完了"),
"Press F":dict(vi="Nhấn F",zh="按 F",es="Pulsa F",pt="Pressione F",ru="Нажмите F",de="F drücken",ja="Fキーを押す"),
"★ OVERDRIVE ★":dict(vi="★ OVERDRIVE ★",zh="★ 超载 ★",es="★ SOBRECARGA ★",pt="★ SOBRECARGA ★",ru="★ ФОРСАЖ ★",de="★ OVERDRIVE ★",ja="★ オーバードライブ ★"),
"Everything. At once.":dict(vi="Tất cả. Cùng một lúc.",zh="一切,同时爆发。",es="Todo. A la vez.",pt="Tudo. De uma vez.",ru="Всё. Сразу.",de="Alles. Auf einmal.",ja="すべてを、同時に。"),
"MASSACRE ×{0}":dict(vi="TÀN SÁT ×{0}",zh="屠杀 ×{0}",es="MASACRE ×{0}",pt="MASSACRE ×{0}",ru="РЕЗНЯ ×{0}",de="MASSAKER ×{0}",ja="大虐殺 ×{0}"),
"ANNIHILATION ×{0}":dict(vi="HỦY DIỆT ×{0}",zh="歼灭 ×{0}",es="ANIQUILACIÓN ×{0}",pt="ANIQUILAÇÃO ×{0}",ru="УНИЧТОЖЕНИЕ ×{0}",de="VERNICHTUNG ×{0}",ja="殲滅 ×{0}"),
"APOCALYPSE ×{0}":dict(vi="TẬN THẾ ×{0}",zh="天启 ×{0}",es="APOCALIPSIS ×{0}",pt="APOCALIPSE ×{0}",ru="АПОКАЛИПСИС ×{0}",de="APOKALYPSE ×{0}",ja="黙示録 ×{0}"),
"+{0} scrap":dict(vi="+{0} phế liệu",zh="+{0} 废料",es="+{0} chatarra",pt="+{0} sucata",ru="+{0} лома",de="+{0} Schrott",ja="+{0} スクラップ"),
"★ {0} KILLS ★":dict(vi="★ {0} MẠNG ★",zh="★ {0} 击杀 ★",es="★ {0} BAJAS ★",pt="★ {0} ABATES ★",ru="★ {0} УБИЙСТВ ★",de="★ {0} KILLS ★",ja="★ {0} キル ★"),
"⚠ SWARM ⚠":dict(vi="⚠ BẦY QUÁI ⚠",zh="⚠ 虫潮 ⚠",es="⚠ ENJAMBRE ⚠",pt="⚠ ENXAME ⚠",ru="⚠ РОЙ ⚠",de="⚠ SCHWARM ⚠",ja="⚠ 群れ襲来 ⚠"),
"Overdrive (all spells)":dict(vi="Overdrive (tất cả phép)",zh="超载(全部法术)",es="Sobrecarga (todos los hechizos)",pt="Sobrecarga (todos os feitiços)",ru="Форсаж (все заклинания)",de="Overdrive (alle Zauber)",ja="オーバードライブ(全スペル)"),
"Hold mouse":dict(vi="Giữ chuột",zh="按住鼠标",es="Mantener ratón",pt="Segurar mouse",ru="Удерживать мышь",de="Maus halten",ja="マウス長押し"),
"Fire Manual Cannon":dict(vi="Bắn pháo tay lái",zh="手动主炮开火",es="Disparar cañón manual",pt="Disparar canhão manual",ru="Стрелять из ручной пушки",de="Manuelle Kanone feuern",ja="手動キャノン発射"),
"Overdrive: casts all your spells at once":dict(vi="Overdrive: tung tất cả phép cùng lúc",zh="超载:同时释放你的全部法术",es="Sobrecarga: lanza todos tus hechizos a la vez",pt="Sobrecarga: lança todos os seus feitiços de uma vez",ru="Форсаж: применяет все заклинания сразу",de="Overdrive: wirkt alle deine Zauber auf einmal",ja="オーバードライブ:全スペルを同時に発動"),
}
keys=json.load(open('tools/i18n/keys.json',encoding='utf-8'));have=set(keys)
import re
for en,tr in NEW.items():
    if en in have: continue
    ph=lambda s:sorted(re.findall(r'\{\d+\}',s))
    for c in L:
        assert c in tr and ph(tr[c])==ph(en),(en,c)
    idx=len(keys);keys.append(en)
    for c in L:
        open(f'tools/i18n/tr/{c}.txt','a',encoding='utf-8').write(f'{idx}|{tr[c]}\n')
json.dump(keys,open('tools/i18n/keys.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
print(len(keys),'keys')
subprocess.run(['python3','tools/i18n/build_lang.py']+L,check=True)
