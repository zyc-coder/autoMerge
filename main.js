const user = require('./user');
const { PROJECT_MAP, FN_TYPE, CUR_BRANCH, PROJECT, TARGET_BRANCH } = require('./branch');
const { chromium } = require('playwright');
const chalk = require('chalk');

process.on('unhandledRejection', (err) => {
  console.log(chalk.red.bold('promise error：', err))
})

if(!Object.values(user).every(item => item)) {
  console.log(chalk.red.bold(`请配置好账号信息`))
  return
}

const wait = (time = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

FN_TYPE == 1 ? autoMerge(PROJECT, TARGET_BRANCH) : newBranch(PROJECT, CUR_BRANCH)

let submitLock = false
async function autoMerge (project, branch, index = 0) {
  if (!(PROJECT && CUR_BRANCH && TARGET_BRANCH)) {
    console.log(chalk.red.bold(`请配置好branch.js里的项目、分支等必要信息`))
    return
  }
  const pLen = project.split(',').length
  const bLen = branch.split(',').length
  const START_TIME = new Date().getTime()
  const RANDOM400 = Math.floor((Math.random() * 400))
  const RANDOM2000UP = Math.floor((Math.random() * 2000)) + (index + 1) * 500
  if (bLen === 1 && pLen === 1) {
    console.log(chalk.yellow(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 开始执行`))
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
    const context = await browser.newContext();
    const closeAll = async function () {
      await context.close()
      await browser.close()
    }
    try {
      const page = await context.newPage();
      await page.goto('http://gitlab.vandream.com/users/sign_in')
      await page.getByLabel('Username or email').fill(user.account);
      await page.getByLabel('Username or email').press('Tab');
      await page.getByLabel('Password').fill(user.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      // name: 'front_group\n/ ' + project
      if (!await page.getByRole('heading', { name: project }).getByRole('link', { name: project }).count().catch((err) => {console.log(err)})) {
        PROJECT_MAP[project] && autoMerge(project, branch)
        console.log(chalk.red.bold(`未找到项目：${PROJECT_MAP[project] || project}`))
        closeAll()
        return
      }
      await page.getByRole('heading', { name: project }).getByRole('link', { name: project }).click();
      await wait(RANDOM400)
      await page.getByRole('link', { name: 'New...', exact: true }).click();
      await wait(RANDOM400)
      await page.getByRole('link', { name: 'New merge request' }).click();
      await wait(RANDOM400)
      await page.getByRole('button', { name: 'Select source branch' }).click();
      await page.getByPlaceholder('Search branches').first().click();
      await page.getByPlaceholder('Search branches').first().fill(CUR_BRANCH);
      if (!await page.getByRole('link', { name: CUR_BRANCH, exact: true }).count().catch((err) => {console.log(err)})) {
        console.log(chalk.red.bold(`${PROJECT_MAP[project] || project}项目下未找到当前分支：${CUR_BRANCH}，请确认后再试`))
        closeAll()
        return
      }
      await page.getByRole('link', { name: CUR_BRANCH, exact: true }).click();
      await page.getByRole('button', { name: 'master' }).click();
      await page.getByPlaceholder('Search branches').nth(1).fill(branch);
      await page.getByPlaceholder('Search branches').nth(1).click();
      if (!await page.getByRole('link', { name: branch, exact: true }).count().catch((err) => {console.log(err)})) {
        console.log(chalk.red.bold(`${PROJECT_MAP[project] || project}项目下未找到目标分支：${branch}，请确认后再试`))
        closeAll()
        return
      }
      await page.getByRole('link', { name: branch, exact: true }).click();
      await page.getByRole('button', { name: 'Compare branches and continue' }).click();
      // 简易锁，防止服务器因点击频率过快报500，不过下面已经做了容错，若500会再次执行
      if (submitLock) {
        await wait(RANDOM2000UP + RANDOM2000UP)
      }
      submitLock = true
      await page.getByRole('button', { name: 'Submit merge request' }).click();
      submitLock = false
      await wait(RANDOM2000UP + RANDOM2000UP)
      const EXISTS_MERGE = await page.getByText('Validate branches Cannot Create: This merge request already exists:').count().catch((err) => {console.log(err)})
      const NO_MERGE = await page.getByText('Currently there are no changes in this merge ').count().catch((err) => {console.log(err)})
      const CAN_MERGE = await page.locator('.accept-merge-request').count().catch((err) => {console.log(err)})
      const WRONG_500 = await page.getByText('Whoops, something went wrong on our end').count().catch((err) => {console.log(err)})
      // console.log('是否存在------', EXISTS_MERGE, NO_MERGE, CAN_MERGE, WRONG_500)
      await wait(RANDOM2000UP)
      if (EXISTS_MERGE) {
        const path = await page.getByRole('link', { name: 'Merge Requests', exact: true }).getAttribute('href').catch((err) => {console.log(err)})
        console.log(chalk.red.bold(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 已存在，请前往检查并处理：http://gitlab.vandream.com${path}`))
        closeAll()
      }
      if (NO_MERGE) {
        console.log(chalk.hex('#d2d2d2')(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 无合并项，已自动关闭merge`))
        await page.getByRole('link', { name: 'Close merge request' }).first().waitFor()
        await page.getByRole('link', { name: 'Close merge request' }).first().click()
        closeAll()
      }
      if (CAN_MERGE) {
        await page.getByRole('button', { name: 'Merge' }).waitFor();
        await page.getByRole('button', { name: 'Merge' }).click();
        const END_TIME = new Date().getTime()
        console.log(chalk.hex('#21b065').bold((`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 合并成功，此次耗时：${Math.floor((END_TIME - START_TIME) / 1000)}s`)))
        closeAll()
      }
      if (WRONG_500) {
        // 大概率是服务器为了防止短时间内多次提交的自我保护
        console.log(chalk.yellow.bold(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 服务器500，开始重新提交`))
        closeAll()
        await wait(RANDOM2000UP)
        autoMerge(project, branch)
      }
      if (!(EXISTS_MERGE || NO_MERGE || CAN_MERGE || WRONG_500)) {
        const path = await page.getByRole('link', { name: 'Merge Requests', exact: true }).getAttribute('href').catch((err) => {console.log(err)})
        console.log(chalk.red.bold(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 存在冲突项，请前往检查并处理：http://gitlab.vandream.com${path}`))
        closeAll()
      }
    } catch (err) {
      console.log(chalk.red.bold(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${CUR_BRANCH} -> ${branch} 合并失败， ${err}`))
      closeAll()
    }
  } else {
    // const allNum = pLen * bLen
    for (let j = 0; j < pLen; j++) {
      for(let i = 0; i < bLen; i++) {
        // if (allNum > 8) {
        //   // 如果合并或创建的requests数量太多，网络不好的时候还是会影响gitlab的ApiResponse（500），故增加些许request间隔
        //   await wait(RANDOM400)
        // }
        await wait(RANDOM400)
        if (project.split(',')[j].charAt(0) !== '-' && branch.split(',')[i].charAt(0) !== '-') {
          autoMerge(project.split(',')[j], branch.split(',')[i], i)
        }
        if ((j === pLen - 1) && (i === bLen - 1)) {
          console.log(chalk.hex('#d2d2d2')(`${new Date().toLocaleString()} --------------所有计划任务都已在执行中，请耐心等待结果，工作再忙，也要记得喝水哦--------------`))
        }
      }
    }
  }
}

async function newBranch (project, branch, index = 0) {
  if (!(PROJECT && CUR_BRANCH)) {
    console.log(chalk.red.bold(`请配置好branch.js里的项目、分支等必要信息`))
    return
  }
  const pLen = project.split(',').length
  const bLen = branch.split(',').length
  const START_TIME = new Date().getTime()
  const RANDOM400 = Math.floor((Math.random() * 400))
  const RANDOM2000UP = Math.floor((Math.random() * 2000)) + (index + 1) * 500
  if (bLen === 1 && pLen === 1) {
    console.log(chalk.yellow(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}： new ${branch} 开始执行`))
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
    const context = await browser.newContext();
    const closeAll = async function () {
      await context.close()
      await browser.close()
    }
    try {
      const page = await context.newPage();
      await page.goto('http://gitlab.vandream.com/users/sign_in')
      await page.getByLabel('Username or email').fill(user.account);
      await page.getByLabel('Username or email').press('Tab');
      await page.getByLabel('Password').fill(user.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      // name: 'front_group\n/ ' + project
      if (!await page.getByRole('heading', { name: project }).getByRole('link', { name: project }).count().catch((err) => {console.log(err)})) {
        console.log(chalk.red.bold(`未找到项目：${PROJECT_MAP[project] || project}`))
        closeAll()
        return
      }
      await page.getByRole('heading', { name: project }).getByRole('link', { name: project }).click();
      await wait(RANDOM400)
      await page.getByRole('listitem').filter({ hasText: 'New file Upload file New directory New branch New tag' }).getByRole('link').click();
      await wait(RANDOM400)
      await page.getByRole('link', { name: 'New branch' }).click();
      await wait(RANDOM400)
      await page.getByLabel('Branch name').fill(branch);
      await wait(RANDOM400)
      await page.getByRole('button', { name: 'Create branch' }).click();
      await wait(RANDOM400)
      const EXISTS_BRANCH = await page.getByText('× Branch already exists').count().catch((err) => {console.log(err)});
      if (EXISTS_BRANCH) {
        console.log(chalk.yellow.bold(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}： ${branch} 分支已存在，无需创建`))
      } else {
        const END_TIME = new Date().getTime()
        console.log(chalk.hex('#21b065').bold((`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}： new ${branch} 成功，此次耗时：${Math.floor((END_TIME - START_TIME) / 1000)}s`)))
      }
      closeAll()
    } catch (err) {
      console.log(chalk.red.bold(`${new Date().toLocaleString()} ${PROJECT_MAP[project] || project}：${branch} 新建失败， ${err}`))
      closeAll()
    }
  } else {
    const allNum = pLen * bLen
    for (let j = 0; j < pLen; j++) {
      for(let i = 0; i < bLen; i++) {
        if (allNum >= 8) {
          // 如果合并或创建的requests数量太多，网络不好的时候还是会影响gitlab的ApiResponse（500），故增加些许request间隔
          await wait(RANDOM400)
          console.log('RANDOM2000UP-----', RANDOM2000UP, RANDOM400)
        }
        if (project.split(',')[j].charAt(0) !== '-' && branch.split(',')[i].charAt(0) !== '-') {
          newBranch(project.split(',')[j], branch.split(',')[i], i)
        }
        if ((j === pLen - 1) && (i === bLen - 1)) {
          console.log(chalk.hex('#d2d2d2')(`${new Date().toLocaleString()} --------------所有计划任务都已在执行中，请耐心等待结果，工作再忙，也要记得喝水哦--------------`))
        }
      }
    }
  }
}

