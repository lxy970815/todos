;(function() {
    'use strict';
    // var b = 2;
    // console.log("window.b", window.b);//undefined
    var $form_add_task = $('.add-task-button') 
    , task_list = {};
    var $task_detail = $('.task-detail');
    var $task_detail_mask = $('.task-detail-mask');
    var $input = $('.add-task input');
    var $addTask = $('.add-task');
    var $delete;
    init();

    $form_add_task.bind('click', function(e) {
        // 禁用默认行为
        e.preventDefault();
        var new_task = {};
        // 获取新task值
        new_task.content = $('input[name=content]').val();
        // 如果新task值为空，则直接返回，否则继续执行
        if(!new_task.content) return;
        //存入新task
        add_task(new_task);
        $input.val(null);
    })
    $('.task-list').on('click','.delete', function(event){
        event.preventDefault();
        var data = $(this).parent().parent().data('index');
        var con = confirm("确定是否删除");
        if(con) {
            $(this).parent().parent().remove();
            // alert('bindEvent');
            delete task_list[data];
            refresh_task_list();
        }
    });

    $('.task-list').on('click', '.detail', function(event){
        event.preventDefault();
        var data = $(this).parent().parent().data('index');
        show_task_detail(data);
        change_task_detail(data);
    });

    $('.task-detail-mask').on('click',function(){
        hide_task_detail();
    });

    function show_task_detail() {
        $task_detail.show();
        $task_detail_mask.show();
    }

    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    function change_task_detail(index) {
        $('.task-detail .content').html(task_list[index].content);
    }
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    function add_task(new_task) {
        // 将新task推入task_list
        task_list.push(new_task);
        // 更新localStorage
        refresh_task_list();
        
    }

    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var j = 0;
        for(var i = 0; i<task_list.length; i++) {
            j=i;
            var $task = render_task_tpl(task_list[j],j);
            $task_list.append($task);
        }
    }

    function render_task_tpl(data,index) {
        if(!data||!index) return;
        var list_item_tpl = '<div class="task-item" data-index="'+ index +'">'+
                                '<span><input type="checkbox"></span>'+
                                '<span class="task-content">'+ data.content +'</span>'+
                                '<span class="fr">'+
                                    '<span class="anchor delete">删除</span>'+
                                    '<span class="anchor detail">详细</span>'+
                                '</span>'+
                            '</div>';
        return $(list_item_tpl);    
    }

    

    function init() {
        // store.clear();
        task_list = store.get('task_list') || [];
        render_task_list();
    }


})();