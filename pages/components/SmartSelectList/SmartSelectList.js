Component({

  properties: {
    list: Array,
    value: null,
  },
  data: {
    list: null,
    value: null,
  },

  methods: {
    onSelected: function() {

    },
    _myPrivateMethod: function() {
      // 内部方法建议以下划线开头
      this.replaceDataOnPath(['A', 0, 'B'], 'myPrivateData') // 这里将 data.A[0].B 设为 'myPrivateData'
      this.applyDataUpdates()
    },
    _propertyChange: function(newVal, oldVal) {

    }
  }

})