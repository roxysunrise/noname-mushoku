// Remote choice callbacks must be independent of module closures.
export function createAiSkills(game, get, lib, ui, status) {
 const remote = source => get.infoFuncOL("_noname_func:" + source);
 const conversion = card => ({basic:"shan",trick:"tao",equip:"sha"})[get.type2(card)];
 const program = player => player.getExpansions("ai_bianyi")[0];
 const colored = card => ["red","black"].includes(get.color(card));
 return {
  ai_qiaoda: {
   enable:["chooseToUse","chooseToRespond"],position:"h",selectCard:1,
   filter(event,player) { return !player.hasSkill("ai_qiaoda_used") && player.getCards("h").some(card=>{const name=conversion(card);return name&&event.filterCard(get.autoViewAs({name},"unsure"),player,event);}); },
   viewAs(cards) { const name=cards.length&&conversion(cards[0]);return name?{name}:null; },
   filterCard(card,player,event) { event ||= status.event;const name=conversion(card);return !!name&&event._backup.filterCard(get.autoViewAs({name},"unsure"),player,event); },
   hiddenCard(player,name) { return !player.hasSkill("ai_qiaoda_used")&&player.getCards("h").some(card=>conversion(card)===name); },
   precontent(event,trigger,player) { player.addTempSkill("ai_qiaoda_used",{global:"phaseAfter"}); },
   check:card=>8-get.value(card),
   ai:{order:5,respondSha:true,respondShan:true,save:true,skillTagFilter(player,tag){const name={respondSha:"sha",respondShan:"shan",save:"tao"}[tag];return !!name&&!player.hasSkill("ai_qiaoda_used")&&player.getCards("h").some(card=>conversion(card)===name);}},
   subSkill:{used:{charlotte:true,mark:true,marktext:"答",intro:{content:"本回合已发动巧答。"}}},
  },
  ai_banxing: {
   trigger:{player:["useCardAfter","respondAfter"]},direct:true,
   filter(event,player){return status.currentPhase!==player&&!player.hasSkill("ai_banxing_used")&&event.cards?.some(card=>player.getHistory("lose").some(loss=>loss.hs?.includes(card)&&loss.getParent()===event))&&game.hasPlayer(target=>target!==player);},
   async content(event,trigger,player){
    const result=await player.chooseTarget("伴行：选择一名其他角色，手牌较少的一方摸一张（相等则你摸）",(card,source,target)=>source!==target)
     .set("ai",remote("target => get.attitude(_status.event.player,target)")).forResult();
    if(!result.bool)return;
    const target=result.targets[0];player.logSkill("ai_banxing",target);player.addTempSkill("ai_banxing_used",{global:"phaseAfter"});
    if(target.countCards("h")<player.countCards("h"))await target.draw();else await player.draw();
   },subSkill:{used:{charlotte:true}},
  },
  ai_tuili:{
   enable:"phaseUse",usable:1,
   async content(event,trigger,player){
    const remaining=get.cards(3);await game.cardsGotoOrdering(remaining);
    player.addTempSkill("ai_yansuan_record",{global:"phaseAfter"});player.storage.ai_yansuan_record ||= [];
    for(let step=0;step<3&&remaining.length&&player.isIn();step++){
     let paid;
     if(step){
      const result=await player.chooseToDiscard("h",`推理：弃置一张手牌，继续第${step+1}步；取消则结束`)
       .set("ai",remote("card => 6-get.value(card)")).forResult();
      if(!result.bool)break;paid=result.cards[0];
     }
     const choice=await player.chooseButton(["推理：选择获得一张牌",remaining],true)
      .set("aiTuiliColor",step===2?get.color(paid,false):null)
      .set("ai",remote("button => get.value(button.link)+(get.color(button.link,false)===_status.event.aiTuiliColor?3:0)")).forResult();
     const card=choice.links?.[0]||remaining[0];remaining.splice(remaining.indexOf(card),1);
     player.storage.ai_yansuan_record.push(card);player.syncStorage("ai_yansuan_record");await player.gain(card,"gain2");
     if(step===2&&colored(paid)&&get.color(paid,false)===get.color(card,false))await player.draw();
    }
    if(remaining.length){
     let bottom=remaining;
     if(remaining.length>1&&player.isIn()){
      const result=await player.chooseToMove("推理：排列剩余牌置于牌堆底（左侧先被摸到）",true)
       .set("list",[["牌堆底",remaining]]).set("processAI",remote("list => [list[0][1].slice()]")).forResult();
      if(result.bool)bottom=result.moved[0];
     }
     await game.cardsGotoPile(bottom);
    }
   },ai:{order:7,result:{player:1}},
  },
  ai_yansuan:{
   trigger:{player:"useCardAfter"},direct:true,
   filter(event,player){return !player.hasSkill("ai_yansuan_used")&&event.cards?.length===1&&!get.is.convertedCard(event.card)&&!get.is.virtualCard(event.card)&&(player.storage.ai_yansuan_record||[]).includes(event.cards[0])&&player.getHistory("lose").some(loss=>loss.hs?.includes(event.cards[0])&&loss.getParent()===event)&&!player.getHistory("sourceDamage",damage=>damage.getParent("useCard")===event).length;},
   async content(event,trigger,player){
    const result=await player.chooseTarget("验算：令一名角色摸一张牌").set("ai",remote("target => get.attitude(_status.event.player,target)")).forResult();
    if(!result.bool)return;player.logSkill("ai_yansuan",result.targets);player.addTempSkill("ai_yansuan_used",{global:"phaseAfter"});await result.targets[0].draw();
   },subSkill:{used:{charlotte:true},record:{charlotte:true,onremove:true}},
  },
  ai_bianyi:{
   enable:"phaseUse",usable:1,position:"h",selectCard:1,filterCard:true,discard:false,lose:false,delay:false,
   filter(event,player){return !program(player)&&player.countCards("h")>0;},check:card=>7-get.value(card),
   async content(event,trigger,player){const next=player.addToExpansion(event.cards,player,"give");next.gaintag.add("ai_bianyi");await next;},
   marktext:"码",intro:{content:"expansion",markcount:"expansion"},
   onremove(player,skill){const cards=player.getExpansions(skill);if(cards.length)player.loseToDiscardpile(cards);},
   ai:{order:8,result:{player:1}},group:"ai_bianyi_execute",
   subSkill:{
    execute:{trigger:{player:"useCardAfter"},
     filter(event,player){const card=program(player);return !!card&&get.type2(event.card)===get.type2(card);},
     prompt:"编译：消耗程序，摸两张牌并执行对应效果？",
     async content(event,trigger,player){
      const card=program(player);if(!card)return;const type=get.type2(card);await player.loseToDiscardpile(card);await player.draw(2);
      if(type==="basic"){player.addTempSkill("ai_bianyi_sha",{global:"phaseAfter"});player.addMark("ai_bianyi_sha",1,false);}
      else if(type==="trick"){
       const result=await player.chooseTarget("编译：可以弃置一名其他角色区域内的一张牌",(card,source,target)=>source!==target&&target.countDiscardableCards(source,"hej")>0)
        .set("ai",remote("target => -get.attitude(_status.event.player,target)")).forResult();
       if(result.bool)await player.discardPlayerCard(result.targets[0],"hej",true);
      }else if(type==="equip"){
       const result=await player.chooseTarget("编译：可以令一名角色回复1点体力",(card,source,target)=>target.isDamaged())
        .set("ai",remote("target => get.attitude(_status.event.player,target)")).forResult();
       if(result.bool)await result.targets[0].recover();
      }
     },
    },
    sha:{charlotte:true,onremove:true,mark:true,marktext:"译",intro:{content:"本回合使用杀的次数上限+#。"},mod:{cardUsable(card,player,num){if(card.name==="sha")return num+player.countMark("ai_bianyi_sha");}}},
   },
  },
  ai_tiaoshi:{
   trigger:{global:"damageBegin4"},usable:1,
   filter(event,player){const card=program(player);return event.num>0&&!!card&&colored(event.card)&&get.color(card)===get.color(event.card);},
   check(event,player){return get.attitude(player,event.player)>0;},prompt:"调试：消耗同颜色程序，令此伤害－1？",
   async content(event,trigger,player){const card=program(player);if(!card)return;await player.loseToDiscardpile(card);trigger.num--;},
  },
  ai_dongcha:{
   enable:"phaseUse",usable:1,filterTarget:(card,player,target)=>target!==player&&target.countCards("h")>0,
   async content(event,trigger,player){
    const target=event.target;
    const result=await player.chooseControl("基本牌","锦囊牌","装备牌").set("prompt","洞察：声明一种类别，再观看随机两张手牌").set("ai",remote("() => 0")).forResult();
    const type=["basic","trick","equip"][result.index],cards=target.getCards("h").randomGets(2);
    const shown=await player.chooseButton(["洞察：命中声明则选择获得对应牌",cards],true)
     .set("aiDongchaType",type)
     .set("filterButton",remote("button => {const cards=_status.event.dialog.buttons.map(button=>button.link);return !cards.some(card=>get.type2(card)===_status.event.aiDongchaType)||get.type2(button.link)===_status.event.aiDongchaType;}"))
     .set("ai",remote("button => get.value(button.link)")).forResult();
    const selected=shown.links?.[0];
    if(selected&&get.type2(selected)===type&&target.getCards("h").includes(selected))await player.gain(selected,target,"giveAuto");else await player.draw();
    if(target.isIn()&&player.countCards("h"))await player.chooseToGive(target,"h",1,true);
   },ai:{order:6,result:{player:1,target:-0.3}},
  },
  ai_zhiyan:{
   trigger:{player:"useCardToPlayered"},direct:true,
   filter(event,player){return event.card.name==="sha"&&!player.hasSkill("ai_zhiyan_used")&&event.target!==player&&event.target.isIn()&&player.getCards("h").some(colored);},
   async content(event,trigger,player){
    const shown=await player.chooseCard("h","直言：展示一张有颜色的手牌，令目标弃同色牌或此杀对其伤害＋1",remote("card => ['red','black'].includes(get.color(card))"))
     .set("ai",remote("card => 6-get.value(card)")).forResult();
    if(!shown.bool)return;player.logSkill("ai_zhiyan",trigger.target);player.addTempSkill("ai_zhiyan_used",{global:"phaseAfter"});await player.showCards(shown.cards,"直言");
    const result=await trigger.target.chooseToDiscard("h","直言：弃置同颜色手牌，否则此杀对你的伤害＋1",remote("card => get.color(card)===_status.event.aiZhiyanColor"))
     .set("chooseonly",true).set("aiZhiyanColor",get.color(shown.cards[0])).set("ai",remote("card => 8-get.value(card)")).forResult();
    if(result.bool){await trigger.target.showCards(result.cards,"直言：展示并弃置");await trigger.target.discard(result.cards);}
    else {const use=trigger.getParent();use.customArgs ||= {};const args=use.customArgs[trigger.target.playerid] ||= {};args.extraDamage=(args.extraDamage||0)+1;}
   },subSkill:{used:{charlotte:true}},
  },
 };
}
