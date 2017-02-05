;(function () {
    'use strict'
    var form_add_task=$(".add-new"),
        new_task={},
        delete_icon,
        detail_icon,
        task_list;/*存储task*/
    init();
    form_add_task.on('submit',function (e) {
        e.preventDefault();
        new_task.content= $(this).find('input[name=content]').val();
        new_task.complete=false;
        new_task.remind=false;
        new_task.desc='';
        new_task.date='';
        if(!new_task.content) return;
        add_task();
        $(this).find('input[name=content]').val('');
    });

    function init() {
        task_list=store.get('task_list') || [];
        render_tlist(task_list);
    }

    function add_task() {
        task_list.push(new_task);
        new_task={};
        refresh_list();
    }

    /*渲染单条list模板*/
    function render_task_tpl(data,index) {
        if(!data||!index) return;
        var tpl='<div class="list-item '+(data.complete?'complete':'')+'" data-index="'+index+'">'+
            '<span><input type="checkbox" '+ (data.complete ? 'checked' : '') +'></span>'+
            '<span class="list-contain">'+
            data.content+
            '</span>'+
            '<span class="detail">详情</span>'+
            '<span class="delete">删除</span>'+
            '</div>';
        return tpl;
    }

    /*渲染单条更新模板*/
    function render_task_detail(index) {
        if(index==undefined||!task_list[index]) return;
        var item = task_list[index];
            if(!item.desc){
                item.desc='';
            }
        var tpl='<div class="task-detail-mask">'+'</div>'+
            '<form class="task-detail">'+
            '<div class="content">'+item.content+'</div>'+
            '<div><input name="content" type="text" autofocus class="ipcontent" value="'+item.content+'"> </div>'+
            '<div class="desc">'+
            '<textarea name="desc" class="desc" >'+item.desc+'</textarea>'+
            '</div>'+
            '<div class="remind">'+
            '<p>提醒</p>'+
            '<input type="text" autocomplete="off" name="date" class="datetime" value="'+item.date+'">'+
            '<button class="update" type="submit">更新</button>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</form>';

        $('.container').append(tpl);

    }

    /*渲染整个list 渲染结束后监听事件*/
    function render_tlist() {
        $('.task-list').html('');
        for(var i=0; i<task_list.length ; i++){
            var task_i =render_task_tpl(task_list[i],i);
            $('.task-list').append(task_i);
        };

        listen_task_delete();
        listen_task_detail();
        listen_task_complete();
        reminder_check();
    }


    /*刷新整个list和localstorage*/
    function refresh_list(){
        store.set('task_list',task_list);
        render_tlist();
    }

    /*删除单条list*/
    function delete_task(index) {
        if (index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_list();
    }

    /*监听删除事件*/
    function listen_task_delete(){
        $(".delete").on('click',function () {
            var $this = $(this),
                index=$this.parent().data('index');
            var tmp = confirm('确定删除？');
            tmp?delete_task(index):null;
        })
    }
    function reminder_check() {
        var current_date = new Date().getTime();
        var remind_time =setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                if (!task_list[i] || !task_list[i].date||task_list[i].remind||task_list[i].complete)
                    continue;
                var task_time = (new Date(task_list[i].date)).getTime();
                if (current_date - task_time >= 1) {
                    update_task({remind: true},i);
                    show_msg(task_list[i].content);
                }
            }
        },500);
    }
    /*监听更新事件*/
    function listen_task_detail() {
        var index;
        $('.remind-box span').on('click',function(){
            hide_msg();
            })
        $('.list-item').on('dblclick',function () {
            index=$(this).data('index');
            show_task_detail(index);
            close_detail();
        });

        $(".detail").on('click',function(){
             index=$(this).parent().data('index');
             show_task_detail(index);
             close_detail();

        });
    }
    /*监听完成事件*/
    function listen_task_complete() {
        $('.list-item input[type=checkbox]').on('click',function () {
            var index=$(this).parent().parent().data('index');
            if(task_list[index].complete){
                task_list[index].complete=false;
                store.set('task_list',task_list);
                $(this).parent().parent().removeClass('complete');
            }else {
                task_list[index].complete=true;
                store.set('task_list',task_list);
                $(this).parent().parent().addClass('complete');
            }

        })
    }

    function show_msg(content) {
        $('.remind-content').html(content);
        $('.alter_video').get(0).play();
        $('.remind-box').show();
    }

    function hide_msg() {
        $('.remind-box').hide();
    }

    function show_task_detail(index) {
        render_task_detail(index);
        $('.datetime').datetimepicker();
        $('.task-detail-mask').show();
        $('.task-detail').show();
        var data={};
        $('.task-detail').on('submit',function (e) {
            e.preventDefault();
            data.desc=$(this).find('[name=desc]').val();
            data.content=$(this).find('input[name=content]').val();
            data.date=$(this).find('[name=date]').val();
            data.remind=false;
            update_task(data,index);
            $('.task-detail').remove();
            $('.task-detail-mask').remove();
        });
        $('.content').on('dblclick',function () {
            $('.ipcontent').show();
            $(this).hide();
        });
    }

    function close_detail() {
        $('.task-detail-mask').on('click',function () {

            $('.task-detail-mask').remove();
            $('.task-detail').remove();
        });
    }

    function update_task(data,index) {
        if(!data||!task_list[index]) return;
        task_list[index]=$.extend({},task_list[index],data);
        store.set('task_list',task_list);
        render_task_detail(index);
        render_tlist();
    }

})();