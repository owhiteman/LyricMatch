using System;
using System.IO;
using System.Linq;

namespace LyricGuess
{
    public class GenerateSongs
    {
        public string testTitle;
        
        public string generateSong()
        {
            string songName = File.ReadLines("songListTitles.txt").Skip(new Random().Next(3763)).Take(1).First();
            testTitle = songName;
            return songName;
        }


    }
}
