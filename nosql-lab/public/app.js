const byId=id=>document.getElementById(id);
const presets={wrong:{username:'alice',password:'wrong-password'},attack:{username:'alice',password:{$ne:''}},valid:{username:'alice',password:'Alice-Lab-Only-440!'},literal:{username:'alice',password:'{"$ne":""}'}};
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{byId('request').value=JSON.stringify(presets[button.dataset.preset],null,2);}));
fetch('/api/health').then(r=>r.json()).then(info=>{byId('environment').textContent=`MongoDB ${info.database} / Node ${info.node} / JSON POST`}).catch(()=>{byId('environment').textContent='Local service unavailable';});
byId('submit').addEventListener('click',async()=>{
  const button=byId('submit');button.disabled=true;byId('status').textContent='Sending request...';
  byId('status').className='';byId('filter').textContent='Awaiting response';byId('query').textContent='Database query: awaiting response';byId('decision').textContent='Awaiting response';byId('protected').textContent='Protected access: awaiting check';byId('protected').className='';
  try {
    let request;
    try{request=JSON.parse(byId('request').value)}catch{throw new Error('Enter valid JSON before submitting');}
    const response=await fetch(`/api/login/${byId('mode').value}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
    const body=await response.json();
    byId('status').textContent=`HTTP ${response.status}: ${body.message??body.error}`;
    byId('status').className=body.trace?.authenticated?'success':'failure';
    byId('filter').textContent=body.trace?.filter?JSON.stringify(body.trace.filter,null,2):'Rejected before filter construction';
    byId('query').textContent=`Database query: ${body.trace?.databaseQueried?'issued':'none'}`;
    byId('decision').textContent=JSON.stringify({authenticated:body.trace?.authenticated??false,account:body.trace?.account??null},null,2);
    const protectedResponse=await fetch('/api/protected');
    const protectedBody=await protectedResponse.json();
    byId('protected').textContent=protectedResponse.ok?protectedBody.note:'Protected notes: access denied';
    byId('protected').className=protectedResponse.ok?'success':'failure';
  }catch(error){byId('status').textContent=error.message;byId('status').className='failure';byId('filter').textContent='No completed request evidence';byId('query').textContent='Database query: unverified';byId('decision').textContent='No completed response';byId('protected').textContent='Protected access: unverified';}
  finally{button.disabled=false;}
});
byId('logout').addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST'});byId('status').textContent='Session cleared';byId('status').className='';byId('filter').textContent='No request since session clear';byId('query').textContent='Database query: none since clear';byId('decision').textContent='No active session';byId('protected').textContent='Protected notes: access denied';byId('protected').className='failure';});
