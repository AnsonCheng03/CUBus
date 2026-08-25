# CUHK_Timetable_fetch
可取得CUSIS之時間表，並儲存到手機行事曆上～
* https://ansoncheng03.github.io/CUHK_Timetable_fetch/
* https://cu-bus.online/cusis/

### 聲明
* 伺服器上的代碼與Github一致，並無蒐集用戶登入名稱及密碼。
* 你唔信我都冇辦法，可以自己開個server up上去用～

## API
* 若使用Get Method連接至../cusis/api.php，會得到所有本學期課程之JSON檔。
* 若使用Post Method，則會得到ICAL行事曆檔案。
* Prams: https://xxxxxxxxxxx.com/cusis/api.php?SID=1155000000&pwd=Passwordhere