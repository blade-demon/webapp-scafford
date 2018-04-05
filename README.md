# webapp-scafford
Webapp开发脚手架，使用gulp，babel, browserify搭建的前端开发脚手架, 可以使用ES6，ES7的部分最新功能比如Async/Await等。

## 开始开发
```
  npm install
  bower install
  gulp
  npm run dev
```

```
  npm run dist
```

## 脚手架功能及简述, 使用gulp工具构建工作流：
  #### 1. 将source文件夹的html文件copy到dist文件夹下
  #### 2. 将source文件夹的jade文件转换成html文件copy到dist文件夹下面
  #### 3. 使用Babel将source/js文件夹的ES6 Javascript文件转换成ES5文件夹下面
  #### 4. 使用browserify将ES6文件转换成前端浏览器可执行的JS文件，解决require的问题
  #### 5. 将source/scss文件夹下面的sass文件转换成css文件，并使用autoprefixer使css对各种浏览器的更新更加完善
  #### 6. jquery和bootstrap通过bower安装，并使用gulp将js,css 文件copy到.tmp文件夹下，然后再压缩js文件，将js和css文件copy到dist/js和dist/css文件夹下面。
  #### 7. gulp serve:dev 监听html，jade, js，sass文件的变化自动刷新页面。
  #### 8. 增加Lazysizes实现页面懒加载。

## 脚手架压缩规则
  - develop
    - js
      - console
      - 不压缩
    -css
      - 不压缩  
  - production
    - js    
      - 放弃console.log(), 压缩文件
    - css, html
      - 压缩
