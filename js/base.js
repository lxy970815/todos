;(function() {
    'use strict';
    var $form_add_task = $('.add-task-button') 
    , task_list = [];
    var $task_detail = $('.task-detail');
    var $task_detail_mask = $('.task-detail-mask');
    var $input = $('.add-task input');
    var $addTask = $('.add-task');
    var $delete;
    var complete_task_list = [];
    var $msg = $('.msg');
    var $msg_content = $msg.find('.msg-content');
    var $msg_confirm = $msg.find('.confirmed');
    var $alert = $('.alert');
    var $body = $('body');
    var $window = $(window);
    

    $form_add_task.bind('click', function(e) {
        // 禁用默认行为
        e.preventDefault();
        var new_task = {};
        // 获取新task值
        new_task.content = $('input[name=content]').val();
        new_task.complete = false;
        // 如果新task值为空，则直接返回，否则继续执行
        if(!new_task.content) return;
        //存入新task
        add_task(new_task);
        $input.val(null);
    });

    $('.task-list').on('click','.delete', function(event){
        event.preventDefault();
        var data = $(this).parent().parent().data('index');
        pop("确定是否删除?").then(function(r){
            if(r) {
                $(this).parent().parent().remove();
                // alert('bindEvent');
                delete task_list[data];
                refresh_task_list();
            }
        });
        
    });

    $('.task-list').on('click', '.complete', function() {
        var data = $(this).parent().parent().data('index');
        if ($(this).prop('checked')) {
            task_list[data].complete = true;
        }else {
            task_list[data].complete = false;
        }
        render_task_list();
    });

    $('.task-list').on('click', '.detail', function(event){
        event.preventDefault();
        var data = $(this).parent().parent().data('index');
        $('.task-detail').data('index', data);
        show_task_detail(data);
        change_task_detail(data);
    });

    $('.task-list').on('dblclick', '.task-item', function() {
        $(this).find('.detail').trigger('click');
    });

    $('.task-detail-mask').on('click',function(){
        hide_task_detail();
    });

    $('.remind button').on('click', function() {
        if($('.content-input').attr('type') == 'text') {
            $('.content').text($('.content-input').val());
        }
        var index = $(this).parent().parent().data('index');
        add_task_desc(index);
        $('.content').show();
        // $('.content-input').hide();
        $('.content-input').attr('type','hidden');
        hide_task_detail();
        refresh_task_list();
    });
    $('.content').on('dblclick', function() {
        $('.content-input').val($('.content').text());
        $('.content').hide();
        $('.content-input').attr('type','text');
    })
    $('.content-input').on('blur', function() {
        $('.content').text($('.content-input').val());
        $('.content').show();
        // $('.content-input').hide();
        $('.content-input').attr('type','hidden');
    })

    function add_task_desc(index) {
        task_list[index].content = $('.content').text();
        task_list[index].description = $('.description textarea').val();

        task_list[index].date = $('.remind input').val();
    };
    function show_task_detail() {
        $task_detail.show();
        $task_detail_mask.show();
    };

    function hide_task_detail() {
        $('.content').show();
        // $('.content-input').hide();
        $('.content-input').attr('type','hidden');
        $task_detail.hide();
        $task_detail_mask.hide();
    };

    function change_task_detail(index) {
        $('.task-detail .content').html(task_list[index].content);
        if(task_list[index].description) {
            $('.task-detail textarea').val(task_list[index].description);
        }else {
            $('.task-detail textarea').val("");
        }
        if(task_list[index].date) {
            $('.remind input').val(task_list[index].date);
        }else {
            $('.remind input').val("");
        }

    };

    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    };

    function add_task(new_task) {
        // 将新task推入task_list
        task_list.push(new_task);
        // 更新localStorage
        refresh_task_list();
    };

    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var j = 0;
        for(var i = 0; i<task_list.length; i++) {
            j=i;
            if(task_list[j]&&task_list[j].complete) {
                complete_task_list.push(task_list[j]);
                var $task = render_task_tpl(task_list[j],j);
                $task_list.append($task);
            }else{
                var $task = render_task_tpl(task_list[j],j);
                $task_list.prepend($task);
            }
        }
    };

    function render_task_tpl(data,index) {
        if(!data) return;
        var list_item_tpl = '<div class="task-item '+ (data.complete ? 'gray' : '')+'" data-index="'+ index +'">'+
                                '<span><input class="complete" '+(data.complete ? 'checked':'')+' type="checkbox"></span>'+
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
        task_remind_check();
    }

    $('.datetime').datetimepicker();

    function task_remind_check() {
        var current_timestamp;
        var itl = setInterval(getStamp, 500)
        function getStamp() {
            for (var i = 0; i<task_list.length; i++) {
                var item = task_list[i], task_timestamp;
                if (!item || !item.date||item.informed) 
                    continue;
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.date)).getTime();
                if (current_timestamp - task_timestamp >=1) {
                    task_list[i].informed = true;
                    notify(item.content);
                }
            }
        }
        
    }

    function notify(content) {
        
        $('.msg-content').html(content);
        if(content) {
            $alert.get(0).play();
            $('.msg').show();
        }
    }

    init();

    function pop(arg) {
        if(!arg) {
            console.error('pop title is required');
        }
        var conf = {}, 
        $box, 
        $mask, 
        $title, 
        $content, 
        $confirm, 
        $cancel,
        dfd,
        confirmed,
        timer;


        dfd = $.Deferred();
        if (typeof arg == 'string') 
            conf.title = arg;
        else {
            conf = $.extend(conf, arg);

        }


        // dfd.resolve()
        $box = $('<div>'+
        '<div class="pop-title">'+conf.title+'</div>' +
        '<div class="pop-content">'+
        '<div><button class="primary confirm">确定</button><button class="cancel">取消</button></div>'
        +'</div>'+
        '</div>')
        .css({
            color: '#444',
            width: 300,
            height: 'auto',
            padding: '10px',
            background: '#fff',
            position: 'fixed',
            'border-radius': '10px',
            'box-shadow': '0 1px 2px rgba(0,0,0,0.3)'
        });

        $title = $box.find('.pop-title').css({
            padding: '5px 10px',
            'font-weight': 900,
            'font-size': 20,
            'text-align': 'center'
        })

        $content = $box.find('.pop-content').css({
            padding: '5px 10px',
            'font-size': 14,
            'text-align': 'center'
        })
        $box.find('button').css({
            padding: '5px 10px',
            width: 100
        })
        $mask = $('<div></div>')
        .css({
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)'
        })

        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');

        timer = setInterval(function(){
            if(confirmed !== undefined) {
                dfd.resolve(confirmed);
                clearInterval(timer);
                hide_pop();
            }
        }, 50);

        $confirm.on('click', function() {
            confirmed = true;
        });
        $cancel.on('click', function() {
            confirmed = false;
        });
        $mask.on('click', function() {
            confirmed = false;
        });
        
        function hide_pop() {
            $mask.remove();
            $box.remove();
        }
        function adjust_box_position() {
            var window_width = $window.width()
            ,window_height = $window.height()
            ,box_width = $box.width()
            ,box_height = $box.height()
            ,move_x
            ,move_y
            ;

            move_x = (window_width - box_width)/2;
            move_y = (window_height - box_height)/2 - 20;

            $box.css({
                left: move_x,
                top: move_y
            })

           

        }

        $window.on('resize', function() {
            adjust_box_position();
        })

        adjust_box_position();
        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }

    $msg_confirm.click(function(){
        $('.msg-content').html('');
        $('.msg').hide();
    })
})();