$("#id").typeahead({
    source: function(query, process) {
        return $.ajax({
            url: '/showoff/watermark/fetchTopics',
            type: 'post',
            data: {
                topicName: query
            },
            dataType: 'json',
            success: function(result) {
                // ����ʡ��resultList�Ĵ�����̣������resultList��һ���ַ����б�                       
                // ����process����������Ϊ�ܱ�typeahead֧�ֵ��ַ������飬��Ϊ������Դ                       
                return process(resultList);
            }
        });
    }
});


https://github.com/tcrosen/twitter-bootstrap-typeahead ����
