<template>
    <div class="topmenu-component">
        <ul class="topMenu">
            <li class="router-menu">
                <router-link to='/main' active-class='router-link-exact-active main'>
                    <i class="iconfont icon-earth"></i>
                </router-link>
            </li>
            <li class="router-menu">
                <router-link to='/focus' active-class='router-link-exact-active focus'>
                    <i class="iconfont icon-focus"></i>
                </router-link>
            </li>
            <li class="router-menu">
                <router-link to='/likes' active-class='router-link-exact-active like'>
                    <i class="iconfont icon-like"></i>
                    <i class="iconfont icon-like-heart"></i>
                </router-link>
            </li>
            <!-- <li>
                    <router-link to='/premium' active-class="router-link-exact-active premium">
                        <i class="iconfont icon-sun"></i>
                        <span class="menuTitle">Premium</span>
                    </router-link>
                </li> -->
        </ul>
    </div>
</template>
<style lang="stylus">
.topMenu {
    display: flex;
    align-items: center;
    height: 45px;
    flex: 1;
    font-size: 16px;
    background: #fff;

    li {
        height: 100%;
        display: flex;
        flex: 1;
        font-size: 2.5rem;
        align-items: center;

        a {
            width: 100%;
            display: flex;
            height: 100%;
            color: #888;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            border-bottom: solid 2px rgba(255, 255, 255, 0);

            &.router-link-exact-active {
                // padding-bottom: 8px;
                border-bottom: solid 2px;
            }
        }
    }

    .icon-like-heart {
        display: none;
    }

    .router-link-exact-active {
        i {
            color: #409eff !important;
        }

        color: #409eff !important;

        &.like {
            .icon-like {
                display: none;
            }

            .icon-like-heart {
                display: inline;
            }
        }

        &.premium {
            color: #f89934;

            .icon-sun {
                color: #FDD5AC;
            }
        }
    }
}
</style>
