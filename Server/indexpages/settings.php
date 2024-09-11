<div class="option-list">
    <div onclick="append_query('lang','<?php echo $lang == 1 ? 'en' : 'tc' ?>');" class="option">
        <div>
            <?php echo $lang == 0 ? '轉換語言' : 'Change Language' ?>
        </div>
    </div>

    <div onclick="window.open('https://payme.hsbc/anson03');" class="option">
        <div>
            <?php echo $translation["Support-btn"][$lang]; ?>
        </div>
    </div>

    <div onclick="window.open('https://github.com/AnsonCheng03');" class="option">
        <div>
            <?php echo $translation["About-btn"][$lang]; ?>
        </div>
    </div>
</div>