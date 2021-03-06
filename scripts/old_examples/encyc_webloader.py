import sys
import os
import errno
import philologic
from philologic.Loader import Loader
from philologic.LoadFilters import *
#from ExtraFilters import *
from philologic.Parser import Parser
from philologic.ParserHelpers import *

def normalize_divs(*columns):
    def normalize_these_columns(loader_obj,text,depth=5):
        current_values = {}
        tmp_file = open(text["sortedtoms"] + ".tmp","w")
        for column in columns:
            current_values[column] = ""
        for line in open(text["sortedtoms"]):
            type, word, id, attrib = line.split('\t')
            id = id.split()
            record = Record(type, word, id)
            record.attrib = eval(attrib)        
            if type == "div1":
                for column in columns:
                    if column in record.attrib:
                        current_values[column] = record.attrib[column]
                    else:
                        current_values[column] = ""
            elif type == "div2":
                for column in columns:
                    if column in record.attrib:
                        current_values[column] = record.attrib[column]
            elif type == "div3":
                for column in columns:
                    if column not in record.attrib:
                        record.attrib[column] = current_values[column]
            print >> tmp_file, record
        tmp_file.close()
        os.remove(text["sortedtoms"])
        os.rename(text["sortedtoms"] + ".tmp",text["sortedtoms"])
    return normalize_these_columns

##########################
## System Configuration **
##########################
database_root = "/Library/WebServer/Documents/philo4beta2/"
install_dir = database_root + "_system_dir/_install_dir/"

###########################
## Configuration options ##
###########################

# Define the name of your database: given on the command line by default
dbname = sys.argv[1]

# Define files to load: given on the command line by default
files = sys.argv[2:]

# Define how many cores you want to use
workers = 6

# Define filters as a list of functions to call, either those in Loader or outside
# an empty list is the default
filters = [make_word_counts, generate_words_sorted,make_token_counts,sorted_toms, prev_next_obj,normalize_divs("articleAuthor","normalizedClass","headword"), word_frequencies_per_obj, generate_pages, make_max_id]


###########################
## Set-up database load ###
###########################

Philo_Types = ["doc","div","para"] # every object type you'll be indexing.  pages don't count, yet.

XPaths = {  ".":"doc", # Always fire a doc against the document root.
            ".//front":"div",
            ".//div":"div",
            ".//div1":"div",
            ".//div2":"div",
            ".//div3":"div",
            ".//p":"para",
            #".//sp":"para",
            #"stage":"para"
            ".//pb":"page",
         } 

Metadata_XPaths = { 
             "doc" : [(ContentExtractor,"./teiHeader/fileDesc/titleStmt/author","author"),
                      (ContentExtractor,"./teiHeader/fileDesc/titleStmt/title", "title"),
                      (ContentExtractor,"./teiHeader/profileDesc/creation/date", "date"),
                      (AttributeExtractor,"./text/body/volume@n","volume"),
                      (AttributeExtractor,".@xml:id","id")],
             "div" : [(ContentExtractor,"./head","headword"),
                      (AttributeExtractor,".@n","n"),
                      (AttributeExtractor, "./index[@type='author']@value","articleAuthor"),
                      (AttributeExtractor, "./index[@type='class']@value","class"),
                      (AttributeExtractor, "./index[@type='normclass']@value","normalizedClass"),
                      (AttributeExtractor, "./index[@type='englishclass']@value","englishClass"),
                      (AttributeExtractor, "./index[@type='generatedclass']@value","generatedClass"),
                      (AttributeExtractor,".@xml:id","id")],
             "para": [(ContentExtractor,"./speaker", "who")],
             "page": [(AttributeExtractor,".@n","n"),
                      (AttributeExtractor,".@src","img"),
                      (AttributeExtractor,".@fac","img")]
           }

non_nesting_tags = ["div1","div2","div3","para"]
self_closing_tags = []
pseudo_empty_tags = []

os.environ["LC_ALL"] = "C" # Exceedingly important to get uniform sort order.
os.environ["PYTHONIOENCODING"] = "utf-8" 
    
template_destination = database_root + dbname
data_destination = template_destination + "/data"

try:
    os.mkdir(template_destination)
except OSError:
    print "The %s database already exists" % dbname
    print "Do you want to delete this database? Yes/No"
    choice = raw_input().lower()
    if choice.startswith('y'):
        os.system('rm -rf %s' % template_destination)
        os.mkdir(template_destination)
    else:
        sys.exit()
os.system("cp -r %s* %s" % (install_dir,template_destination))
os.system("cp %s.htaccess %s" % (install_dir,template_destination))
print "copied templates to %s" % template_destination


####################
## Load the files ##
####################

l = Loader(workers, filters=filters, clean=True)
l.setup_dir(data_destination,files)
l.parse_files(XPaths,Metadata_XPaths,non_nesting_tags,self_closing_tags,pseudo_empty_tags)
l.merge_objects()
l.analyze()
l.make_tables()
l.finish(Philo_Types, Metadata_XPaths)
print >> sys.stderr, "done indexing."
