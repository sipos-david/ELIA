import asyncio
import sys
from datetime import datetime, timedelta
import discord
from discord.member import VoiceState
from distest import TestCollector
from distest import run_dtest_bot
from discord import Embed, Member, Status
from distest.TestInterface import TestInterface

test_collector = TestCollector()

performance_output: str = ""

def get_base_embed(embed_title):
    base_embed = (
        Embed(
            title=embed_title,
            color=6402394,
            type="rich",
        )
        .set_footer(
            icon_url="https://cdn.discordapp.com/embed/avatars/1.png",
            text="ELIA - TESTER"
        )
    )
    return base_embed

def add_time_to_output(message: str, time_taken: timedelta):
    global performance_output
    performance_output += "{}\n\tTime taken:\t\t\t{}\n\n".format(message, time_taken.total_seconds())

@test_collector()
async def ping_time(interface: TestInterface):
    start_time: datetime = datetime.now()
    for i in range(0, 10):
        await interface.assert_reply_embed_regex("+ping", {"title": "Pong!"})
    add_time_to_output("Sent 10 ping requests", datetime.now() - start_time)

@test_collector()
async def meme_time(interface: TestInterface):
    start_time: datetime = datetime.now()
    for i in range(0, 10):
        await interface.assert_reply_has_image("+meme https://i.redd.it/7ptrlc47tuc51.jpg")
    global meme_time_taken
    add_time_to_output("Sent 10 memes", datetime.now() - start_time)

@test_collector()
async def pin_time(interface: TestInterface):
    start_time: datetime = datetime.now()
    for i in range(0, 10):
        await interface.assert_reply_contains("+pin pinned", "pinned")
    global pin_time_taken
    add_time_to_output("Sent 10 pin requests", datetime.now() - start_time)

@test_collector()
async def voice_connect_disconnect_time(interface: TestInterface):
    await interface.send_message("+play https://youtube.com/watch?v=jHkxauiiEWs")
    connect_start_time: datetime = datetime.now()
    await interface.wait_for_event("voice_state_update", lambda m, before, after: before.channel == None and after.channel != None)
    global voice_connect_time_taken
    voice_connect_time_taken = datetime.now() - connect_start_time
    add_time_to_output("Sent a play request", datetime.now() - connect_start_time)

    await asyncio.sleep(3)
    
    await interface.send_message("+leave")
    disconnect_start_time: datetime = datetime.now()
    await interface.wait_for_event("voice_state_update", lambda m, before, after: before.channel != None and after.channel == None)
    global voice_disconnect_time_taken
    add_time_to_output("Sent a leave request", datetime.now() - disconnect_start_time)

@test_collector()
async def play_start_time(interface: TestInterface):
    play_embed = get_base_embed(":musical_note: Now Playing ***https://youtube.com/watch?v=jHkxauiiEWs***")

    start_time: datetime = datetime.now()
    await interface.assert_reply_embed_equals("+play https://youtube.com/watch?v=jHkxauiiEWs", play_embed)
    add_time_to_output("Requested a song, starting time", datetime.now() - start_time)
    await interface.send_message("+leave")

@test_collector()
async def write_performance_metrics(interface: TestInterface):
    await interface.send_message("```{}```".format(performance_output))

if __name__ == "__main__":
    run_dtest_bot(sys.argv, test_collector, timeout=10)
