'use strict';

import gulp from 'gulp';
const { src, dest } = gulp;
import autoprefixer from 'gulp-autoprefixer';
import cssbeautify from 'gulp-cssbeautify';
import removeComments from 'gulp-strip-css-comments';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import * as nodeSass from 'sass';
const sass = gulpSass(nodeSass);
import cssnano from 'gulp-cssnano';
import rigger from 'gulp-rigger';
import uglify from 'gulp-uglify';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';
import svgSprite from 'gulp-svg-sprite';

browserSync.create();

/** PATHS */
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        html: distPath,
        css: `${distPath}assets/css/`,
        js: `${distPath}assets/js/`,
        images: `${distPath}assets/images/`,
        fonts: `${distPath}assets/fonts/`
    },
    src: {
        html: `${srcPath}*.html`,
        css: `${srcPath}assets/scss/index.scss`,
        js: `${srcPath}assets/js/*.js`,
        images: srcPath + 'assets/images/**/*.{jpeg,jpg,gif,png,svg,webp,avif,ico,webmanifest,xml,json}',
        fonts: srcPath + 'assets/fonts/**/*.{eot,woff,woff2,ttf,svg}'
    },
    watch: {
        html: `${srcPath}**/*.html`,
        css: `${srcPath}assets/scss/**/*.scss`,
        js: `${srcPath}assets/js/**/*.js`,
        images: srcPath + 'assets/images/**/*.{jpeg,jpg,gif,png,svg,webp,avif,ico,webmanifest,xml,json}',
        fonts: srcPath + 'assets/fonts/**/*.{eot,woff,woff2,ttf,svg}'
    },
    clean: [
        '!dist/assets/icons',
        'dist/assets/images/',
        'dist/assets/fonts/',
        'dist/assets/js/',
        'dist/assets/css/',
        'dist/*.html'
    ]
};

function makeSprite() {
    return src('src/assets/icons/*.svg')
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../sprite.svg'
                    }
                }
            })
        )
        .pipe(dest('dist/assets/icons/'));
}

function serve() {
    browserSync.init({
        server: {
            baseDir: './' + distPath
        }
    });
}

function html() {
    return src(path.src.html, { base: srcPath })
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }));
}

function css() {
    return src(path.src.css, { base: `${srcPath}assets/scss` })
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(
            cssnano({
                zindex: false,
                discardComments: {
                    removeAll: true
                }
            })
        )
        .pipe(removeComments())
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }));
}

function js() {
    return src(path.src.js, { base: `${srcPath}assets/js` })
        .pipe(rigger())
        .pipe(uglify())
        .pipe(
            rename({
                suffix: '.min',
                extname: '.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));
}

function images() {
    return src(path.src.images, { base: `${srcPath}assets/images` })
        .pipe(
            imagemin([
                gifsicle({ interlaced: true }),
                mozjpeg({ quality: 75, progressive: true }),
                optipng({ optimizationLevel: 5 }),
                svgo({
                    plugins: [
                        {
                            name: 'removeViewBox',
                            active: true
                        },
                        {
                            name: 'cleanupIDs',
                            active: false
                        }
                    ]
                })
            ])
        )
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }));
}

function fonts() {
    return src(path.src.fonts, { base: `${srcPath}assets/fonts` })
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }));
}

const reset = () => {
    return deleteAsync(path.clean);
};

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(reset, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, serve);

//exports.html = html;
export { html, css, js, images, fonts, reset, build, watch, makeSprite };
export default watch;

