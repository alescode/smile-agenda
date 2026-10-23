// Función de lectura para pasar a tab.playwright.evaluate; no ejecutar en Node.
// Verificar primero que los selectores coinciden con la interfaz actual.
() => {
  const select=document.querySelector('#clinica');
  const from=document.querySelector('input[name="fecha1"]');
  const to=document.querySelector('input[name="fecha2"]');
  if(!select||!from||!to)throw Error('Agenda no disponible: comprobar sesión y estructura');
  const table=document.querySelector('#tabla');
  if(table){
    const headers=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
    const expected=['FECHA','HORA','DUR','DOCUMENTO','PACIENTE','Alumno','CLINICA FISICA','ESTATUS'];
    if(expected.some((h,i)=>headers[i]!==h))throw Error('La tabla cambió');
  }
  const department=select.selectedOptions[0].textContent.trim();
  return {from:from.value,to:to.value,departmentId:select.value,department,
    rows:[...document.querySelectorAll('#tabla tbody tr.row_table')].map(r=>{
      const c=r.cells;if(c.length<8)throw Error('Fila incompleta');
      const id=[...r.querySelectorAll('button[onclick]')].map(b=>b.getAttribute('onclick').match(/^cita=(\d+);/)?.[1]).find(Boolean);
      if(!id)throw Error('No se encontró identificador estable de la cita');
      const raw=c[0].innerText.trim();if(!/^\d{2}\/\d{2}\/\d{4}$/.test(raw))throw Error('Fecha no reconocida');
      const date=raw.split('/').reverse().join('-');if(date<from.value||date>to.value)throw Error('Resultados fuera de rango');
      return {id,date,time:c[1].innerText.trim(),duration:c[2].innerText.trim(),patient:c[4].innerText.trim().replace(/^\d+\s*-\s*/,''),department,clinic:c[6].innerText.trim(),status:c[7].innerText.trim()};
    })};
}
