# Horários tejo

Horários das travessias de barco do Tejo, operados pela Soflusa e Transtejo.


## Get data from Transtejo

https://ttsl.pt/passageiros/horarios-de-ligacoes-fluviais/ligacao-barreiro-terreiro-do-paco/

```
var times = [];
var th = $0.querySelector('thead').querySelectorAll('td');
var tr =  $0.querySelector('tbody').querySelectorAll('tr');
th.forEach((th, i) => {
	//debugger
	var hour = th.textContent.replace('h', '');
	tr.forEach((tr, j) => {
		var minute = tr.querySelectorAll('td')[i].textContent.replace('*', '');
		if (minute && minute !== '—') {
			var time = {
				'h': hour,
				'm': minute.replace(/\s/g, '')
			}
			if(hour >= 0 && hour < 5) {
            	time.am = true; // add 'am', if agter midnight
			}
			times.push(time);
		}
	});
});
console.log(times)
copy(times)
console.log('copied');
```