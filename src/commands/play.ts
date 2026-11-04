
import { Command } from "..";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Metadata } from "..";
import type { ChatInputCommandInteraction } from "discord.js";

export default class PlayCommand extends Command {
  readonly name = "play";
  override readonly inVoiceChannel = true;

  readonly slashBuilder = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music from a supported URL or search query")
    .addStringOption((opt) =>
      opt
        .setName("input")
        .setDescription("A supported URL or search query")
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("skip")
        .setDescription("Skip the current song")
        .setRequired(false),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("position")
        .setDescription("Queue position")
        .setRequired(false),
    );

  async onChatInput(
    interaction: ChatInputCommandInteraction<"cached">,
  ) {
    const input = interaction.options.getString("input", true);
    const skip = interaction.options.getBoolean("skip") ?? false;
    const position =
      interaction.options.getInteger("position") ?? undefined;

    const vc = interaction.member.voice.channel;

    if (!vc) {
      await interaction.reply({
        content: "Join a voice channel first!",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      await this.client.distube.play<Metadata>(vc, input, {
        skip,
        position,
        textChannel: interaction.channel ?? undefined,
        member: interaction.member,
        metadata: { interaction },
      });
    } catch (e: unknown) {
      console.error("DisTube play failed:", e);

      if (e instanceof Error) {
        console.error("Error name:", e.name);
        console.error("Error message:", e.message);
        console.error("Error cause:", e.cause);
        console.error("Error stack:", e.stack);

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Blurple")
              .setTitle("DisTube")
              .setDescription(`Error: \`${e.message}\``),
          ],
        }).catch(console.error);
      } else {
        console.error("Unknown DisTube error:", e);
        await interaction.editReply("An unknown playback error occurred.")
          .catch(console.error);
      }
    }
  }
}
