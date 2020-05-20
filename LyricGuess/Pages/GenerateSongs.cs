using System;
using System.Collections;
using System.IO;
using System.Linq;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace LyricGuess
{
    public class GenerateSongs
    {
        public string[] songs;
        ArrayList list = new ArrayList();
        public string testTitle;
        
        public string generateSong()
        {
            //string songName = File.ReadLines("songListTitles.txt").Skip(new Random().Next(3763)).Take(1).First();

            Random random = new Random();
            int randomIndex = random.Next(0, songs.Length);
            string songName = songs[randomIndex];

            return songName;
        }

        //Get the song titles from Azure Blob storage
        public async System.Threading.Tasks.Task<string> GetBlobAsync()
        {
            string connectionString = $"DefaultEndpointsProtocol=https;AccountName=lyricmatchsongs;AccountKey=nbpEpYO+1GnfNZPGOhpKcMd6lzZbWATUJWLkDt4bLWKk2pujFS+Zqc+bWd/v/25WvcBipYxJh22KKAJDWT7ejg==;EndpointSuffix=core.windows.net";

            // Setup the connection to the storage account
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(connectionString);

            // Connect to the blob storage
            var serviceClient = storageAccount.CreateCloudBlobClient();
            // Connect to the blob container
            CloudBlobContainer container = serviceClient.GetContainerReference("songs");
            // Connect to the blob file
            CloudBlob blob = container.GetBlobReference("songListTitles.txt");
            // Get the blob file as text

            //string contents = blob.DownloadTextAsync().Result;

            //songs = contents;

            using (var stream = await blob.OpenReadAsync())
            {
                using (StreamReader reader = new StreamReader(stream))
                {
                    string line;
                    while ((line = reader.ReadLine()) != null)
                    {
                        list.Add(line);
                    }
                }
            }

            string[] tempArr = (string[])list.ToArray(typeof(string));
            songs = tempArr;
            testTitle = songs[1];

            return "0";
        }
        
    }
}
