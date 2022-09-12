jQuery(function() {
    $(".select2-select-site").select2();
    $(".select2-select-site").prop("disabled", true);

    $('#ch-enable-site-selection').on('change',function() {
        $(".select2-select-site").prop("disabled", !this.checked);
    });
});