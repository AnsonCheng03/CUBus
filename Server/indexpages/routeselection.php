<!--Script!-->
<script>
  //Auto Suggestion
  const choices = ["<?php echo implode('","', $transbuilding); ?>"];
  if (document.getElementById("Startbd") && document.getElementById("Destbd")) {
    autocomplete(document.getElementById("Startbd"), choices);
    autocomplete(document.getElementById("Destbd"), choices);
  }

</script>

<script>
  if (document.getElementById("deptnow").checked) {
    if (document.getElementById("time-now")) document.getElementById("time-now").style.display = "block";
  } else {
    if (document.getElementById("time-now")) document.getElementById("time-schedule").style.display = "block";
  }

  date_change();
  modechange();

  document.querySelectorAll(' input[name="mode" ]').forEach(element => {
    element.addEventListener('change', modechange);
  });
</script>
</footer>